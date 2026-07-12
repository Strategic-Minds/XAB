import { streamText, gateway, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { tools } from "@/lib/ai-tools";
import { executeTool } from "@/lib/tool-executor";
import { generateSystemPrompt, ADVANCED } from "@/lib/ai-config";

export const maxDuration = 60;

const MODEL_MAP: Record<string, string> = {
  // OpenAI
  "gpt-4o":                "openai/gpt-4o",
  "gpt-4o-mini":           "openai/gpt-4o-mini",
  "gpt-4.1":               "openai/gpt-4.1",
  "gpt-4.1-mini":          "openai/gpt-4.1-mini",
  "gpt-5":                 "openai/gpt-5",
  "o3":                    "openai/o3",
  "o4-mini":               "openai/o4-mini",
  // Anthropic
  "claude-sonnet-4":       "anthropic/claude-sonnet-4",
  "claude-sonnet-4.5":     "anthropic/claude-sonnet-4.5",
  "claude-sonnet-5":       "anthropic/claude-sonnet-5",
  "claude-opus-4":         "anthropic/claude-opus-4",
  "claude-haiku-4.5":      "anthropic/claude-haiku-4.5",
  // Google
  "gemini-2.5-flash":      "google/gemini-2.5-flash",
  "gemini-2.5-pro":        "google/gemini-2.5-pro",
  "gemini-3.5-flash":      "google/gemini-3.5-flash",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { messages, model: modelKey = "gpt-4o", conversationId, systemPrompt } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Resolve gateway model id
    const modelId = MODEL_MAP[modelKey] ?? "openai/gpt-4o";

    // Build system prompt from AI configuration (customizable)
    const system = systemPrompt ?? generateSystemPrompt();

    // Persist conversation if authenticated
    let activeConversationId = conversationId;
    if (user && !conversationId) {
      const firstUserMsg = messages.find((m: { role: string }) => m.role === "user");
      const title = firstUserMsg?.content?.slice(0, 60) ?? "New Conversation";
      const { data: conv } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title, model: modelKey })
        .select("id")
        .single();
      activeConversationId = conv?.id;
    }

    // Persist user message
    if (user && activeConversationId) {
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
      if (lastUserMsg) {
        await supabase.from("chat_messages").insert({
          conversation_id: activeConversationId,
          role: "user",
          content: lastUserMsg.content,
          model: modelId,
        });
      }
    }

    const result = streamText({
      model: gateway(modelId),
      system,
      tools,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text, toolCalls }) => {
        // Persist assistant reply
        if (user && activeConversationId) {
          await supabase.from("chat_messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: text,
            model: modelId,
            tool_calls: toolCalls,
          });
          // Bump updated_at on conversation
          await supabase
            .from("chat_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);
        }

        // Execute tools asynchronously after stream returns
        if (toolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            const tc = toolCall as any;
            // Execute in background without blocking stream
            executeTool({
              userId: user?.id || "anonymous",
              toolName: tc.toolName,
              parameters: tc.parameters as Record<string, any>,
            }).catch(err =>
              console.error("[XAB] Tool execution error:", err)
            );

            // Log tool execution for audit trail
            if (user && activeConversationId) {
              try {
                await supabase
                  .from("tool_executions")
                  .insert({
                    conversation_id: activeConversationId,
                    user_id: user.id,
                    tool_name: tc.toolName,
                    parameters: tc.parameters,
                    status: "executing",
                  });
              } catch (err) {
                console.error("[XAB] Error logging tool execution:", err);
              }
            }
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[XAB] /api/chat error:", err);
    return new Response(JSON.stringify({ error: "Chat failed" }), { status: 500 });
  }
}
