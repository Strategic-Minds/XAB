import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const openai = createOpenAI({
  baseURL: process.env.VERCEL_AI_GATEWAY_TOKEN
    ? 'https://ai-gateway.vercel.sh/v1'
    : undefined,
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: workflow, error: wfErr } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .single();

  if (wfErr || !workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { input = {} } = body;

  const { data: run } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: id,
      user_id: user?.id ?? null,
      status: "running",
    })
    .select("id")
    .single();

  const runId = run?.id;
  const startedAt = Date.now();

  try {
    const steps: Array<{ step: number; name: string; status: string; output: string }> = [];
    const workflowSteps: Array<{ name: string; prompt?: string }> = workflow.steps ?? [];

    // Execute each step sequentially
    let previousOutput = "";
    for (let i = 0; i < workflowSteps.length; i++) {
      const step = workflowSteps[i];
      const stepPrompt = step.prompt
        ? `${step.prompt}\n\nPrevious step output: ${previousOutput}\nInput: ${JSON.stringify(input)}`
        : `Execute step: "${step.name}". Previous output: ${previousOutput}. Input: ${JSON.stringify(input)}. Be concise.`;

      const result = await generateText({
        model: openai("openai/gpt-4o-mini"),
        system: `You are executing a step in the workflow: "${workflow.name}". Be precise and concise.`,
        prompt: stepPrompt,
      });

      previousOutput = result.text;
      steps.push({
        step: i + 1,
        name: step.name ?? `Step ${i + 1}`,
        status: "success",
        output: result.text,
      });
    }

    const duration = Date.now() - startedAt;

    if (runId) {
      await supabase
        .from("workflow_runs")
        .update({
          status: "success",
          output: { final: previousOutput, steps },
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          steps_completed: steps.length,
        })
        .eq("id", runId);
    }
    // Update workflow stats
    await supabase.from("workflows").update({
      run_count: (workflow.run_count ?? 0) + 1,
      last_run_at: new Date().toISOString(),
    }).eq("id", id);

    return NextResponse.json({ runId, status: "success", steps, output: previousOutput, duration_ms: duration });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Workflow run failed";
    console.error("[XAB] Workflow run error:", message);

    if (runId) {
      await supabase
        .from("workflow_runs")
        .update({
          status: "failed",
          error: message,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startedAt,
        })
        .eq("id", runId);
    }

    return NextResponse.json({ error: message, runId }, { status: 500 });
  }
}
