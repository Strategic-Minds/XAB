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

  // Fetch agent config
  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const { input = {} } = body;

  // Create run record
  const { data: run } = await supabase
    .from("agent_runs")
    .insert({
      agent_id: id,
      agent_name: agent.name,
      agent_type: agent.type ?? "general",
      status: "running",
      action: typeof input === "string" ? input : JSON.stringify(input),
      metadata: { user_id: user?.id ?? null, input },
    })
    .select("id")
    .single();

  const runId = run?.id;
  const startedAt = Date.now();

  try {
    const modelId = agent.model
      ? (agent.model.includes("/") ? agent.model : `openai/${agent.model}`)
      : "openai/gpt-4o";

    const systemPrompt = agent.system_prompt ??
      `You are ${agent.name ?? "an AI agent"}. ${agent.description ?? ""}. Complete the task provided with precision. Return a structured summary of your actions and results.`;

    const result = await generateText({
      model: openai(modelId),
      system: systemPrompt,
      prompt: typeof input === "string"
        ? input
        : `Execute your task. Context: ${JSON.stringify(input)}`,
      maxSteps: 5,
    });

    const duration = Date.now() - startedAt;

    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "success",
          output: result.text,
          completed_at: new Date().toISOString(),
          metadata: { duration_ms: duration, usage: result.usage, model: modelId },
        })
        .eq("id", runId);
    }
    // Increment agent run_count and update last_run_at
    await supabase.from("agents").update({
      run_count: (agent.run_count ?? 0) + 1,
      last_run_at: new Date().toISOString(),
      status: "active",
    }).eq("id", id);

    return NextResponse.json({
      runId,
      status: "success",
      output: result.text,
      usage: result.usage,
      duration_ms: duration,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Agent run failed";
    console.error("[XAB] Agent run error:", message);

    if (runId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "failed",
          output: message,
          completed_at: new Date().toISOString(),
          metadata: { error: message, duration_ms: Date.now() - startedAt },
        })
        .eq("id", runId);
    }

    return NextResponse.json({ error: message, runId }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data } = await supabase
    .from("agent_runs")
    .select("id, status, action, output, started_at, completed_at, metadata")
    .eq("agent_id", id)
    .order("started_at", { ascending: false })
    .limit(20);

  return NextResponse.json(data ?? []);
}
