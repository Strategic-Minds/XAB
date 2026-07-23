export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type ModelTask =
  | 'chat'
  | 'reasoning'
  | 'coding'
  | 'research'
  | 'fast'
  | 'vision'
  | 'content'

export interface ChatOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  timeout_ms?: number
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string | null }
  }>
  error?: { message?: string }
}

const DEFAULT_MODELS: Record<ModelTask, string> = {
  chat: process.env.AI_MODEL_CHAT ?? 'openai/gpt-4.1-mini',
  reasoning: process.env.AI_MODEL_REASONING ?? 'openai/o4-mini',
  coding: process.env.AI_MODEL_CODING ?? 'openai/gpt-4.1',
  research: process.env.AI_MODEL_RESEARCH ?? 'openai/gpt-4.1',
  fast: process.env.AI_MODEL_FAST ?? 'openai/gpt-4.1-mini',
  vision: process.env.AI_MODEL_VISION ?? 'openai/gpt-4.1',
  content: process.env.AI_MODEL_CONTENT ?? 'openai/gpt-4.1-mini',
}

function resolveConfiguration(): { baseUrl: string; apiKey: string } {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_GATEWAY_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY
  const apiKey = gatewayKey ?? openAiKey

  if (!apiKey) {
    throw new Error('AI provider is not configured. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY.')
  }

  const baseUrl = (
    process.env.AI_GATEWAY_BASE_URL ??
    (gatewayKey ? 'https://ai-gateway.vercel.sh/v1' : 'https://api.openai.com/v1')
  ).replace(/\/$/, '')

  return { baseUrl, apiKey }
}

function normalizeModel(model: string, usingGateway: boolean): string {
  if (usingGateway) return model
  return model.startsWith('openai/') ? model.slice('openai/'.length) : model
}

function validateMessages(messages: ChatMessage[]): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('At least one chat message is required.')
  }

  for (const message of messages) {
    if (!['system', 'user', 'assistant'].includes(message.role)) {
      throw new Error(`Unsupported chat role: ${String(message.role)}`)
    }
    if (typeof message.content !== 'string' || message.content.trim().length === 0) {
      throw new Error('Every chat message must contain non-empty text content.')
    }
  }
}

export function modelFor(task: ModelTask): string {
  return DEFAULT_MODELS[task] ?? DEFAULT_MODELS.chat
}

async function createCompletionRequest(
  messages: ChatMessage[],
  options: ChatOptions,
  stream: boolean
): Promise<Response> {
  validateMessages(messages)
  const { baseUrl, apiKey } = resolveConfiguration()
  const usingGateway = baseUrl.includes('ai-gateway.vercel.sh') || Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY)
  const model = normalizeModel(options.model ?? modelFor('chat'), usingGateway)

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens ?? 2048,
    }),
    signal: AbortSignal.timeout(options.timeout_ms ?? 90000),
  })

  if (!response.ok) {
    const body = await response.text()
    let providerMessage = body.slice(0, 300)

    try {
      const parsed = JSON.parse(body) as ChatCompletionResponse
      providerMessage = parsed.error?.message ?? providerMessage
    } catch {
      // Keep the sanitized response excerpt.
    }

    throw new Error(`AI provider request failed with HTTP ${response.status}: ${providerMessage}`)
  }

  return response
}

export async function chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const response = await createCompletionRequest(messages, options, false)
  const data = await response.json() as ChatCompletionResponse
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('AI provider returned no assistant content.')
  }

  return content
}

export async function* chatStream(messages: ChatMessage[], options: ChatOptions = {}): AsyncGenerator<string> {
  const response = await createCompletionRequest(messages, options, true)

  if (!response.body) {
    throw new Error('AI provider returned no streaming response body.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.startsWith('data:')) continue

      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue

      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string | null } }>
        }
        const token = parsed.choices?.[0]?.delta?.content
        if (token) yield token
      } catch {
        // Ignore malformed keepalive or provider metadata frames.
      }
    }
  }

  if (buffer.trim().startsWith('data:')) {
    const payload = buffer.trim().slice(5).trim()
    if (payload && payload !== '[DONE]') {
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string | null } }>
        }
        const token = parsed.choices?.[0]?.delta?.content
        if (token) yield token
      } catch {
        // Ignore malformed trailing metadata frame.
      }
    }
  }
}
