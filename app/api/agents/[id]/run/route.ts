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

  const { systemPrompt, input } = await req.json();
  const modelId = agent.model || "gpt-4o-mini";

  try {
    const startTime = Date.now();
    const result = await generateText({
  // @ts-expect-error -- type safety suppressed for compatibility
      model: openai(modelId) as any,
      system: systemPrompt,
      prompt: input,
      temperature: agent.temperature ?? 0.7,
      maxTokens: agent.max_tokens ?? 2000,
    });

    const duration = Date.now() - startTime;

    // Log to Supabase
    await supabase.from("agent_runs").insert({
      agent_id: id,
      user_id: user?.id,
      input,
      output: result.text,
      model: modelId,
      metadata: { duration_ms: duration, usage: result.usage, model: modelId },
    });

    return NextResponse.json({
      output: result.text,
      usage: result.usage,
      duration_ms: duration,
    });
  } catch (error) {
    console.error("[agent run error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
