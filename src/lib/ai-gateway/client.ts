/**
 * XAB AI Gateway Client
 * Single entry point for ALL LLM calls across XAB.
 * Routes through Vercel AI Gateway — one key, 100+ models, zero markup.
 * Endpoint: https://ai-gateway.vercel.sh/v1
 */

const GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1';

function getKey(): string {
  const key = process.env.AI_GATEWAY_API_KEY;
  if (!key) throw new Error('AI_GATEWAY_API_KEY not configured. Set it in Vercel project env vars.');
  return key;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;       // default: openai/gpt-4o-mini
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface EmbedOptions {
  model?: string;       // default: openai/text-embedding-3-small
}

// ─── CHAT ──────────────────────────────────────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const {
    model = 'openai/gpt-4o-mini',
    maxTokens = 2048,
    temperature = 0.7,
    systemPrompt,
  } = options;

  const allMessages: ChatMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...messages,
  ];

  const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── STREAMING CHAT ────────────────────────────────────────────────────────

export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): AsyncGenerator<string> {
  const {
    model = 'openai/gpt-4o-mini',
    maxTokens = 2048,
    temperature = 0.7,
    systemPrompt,
  } = options;

  const allMessages: ChatMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...messages,
  ];

  const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) throw new Error(`Gateway stream error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const json = line.slice(6);
      if (json === '[DONE]') return;
      try {
        const parsed = JSON.parse(json);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch { /* skip malformed chunks */ }
    }
  }
}

// ─── EMBEDDINGS ────────────────────────────────────────────────────────────

export async function embed(
  text: string | string[],
  options: EmbedOptions = {}
): Promise<number[][]> {
  const { model = 'openai/text-embedding-3-small' } = options;
  const input = Array.isArray(text) ? text : [text];

  const res = await fetch(`${GATEWAY_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  const results = await embed([text]);
  return results[0];
}

// ─── MODEL ROUTER ──────────────────────────────────────────────────────────
// Route tasks to the right model by job type
// Fallback chain is automatic via Vercel Gateway

export const MODELS = {
  // Fast + cheap — default for most ops
  fast: 'openai/gpt-4o-mini',
  // Powerful — for planning, code, analysis
  smart: 'openai/gpt-4o',
  // Reasoning — for complex multi-step
  reason: 'openai/o4-mini',
  // Alternative — Claude for long context/docs
  claude: 'anthropic/claude-sonnet-4-5',
  // Embeddings
  embed: 'openai/text-embedding-3-small',
  embedLarge: 'openai/text-embedding-3-large',
} as const;

export type ModelKey = keyof typeof MODELS;

export function modelFor(task: 'audit' | 'build' | 'chat' | 'embed' | 'plan' | 'validate'): string {
  switch (task) {
    case 'audit':    return MODELS.smart;
    case 'build':    return MODELS.smart;
    case 'plan':     return MODELS.reason;
    case 'validate': return MODELS.smart;
    case 'chat':     return MODELS.fast;
    case 'embed':    return MODELS.embed;
    default:         return MODELS.fast;
  }
}