import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai";
import { getTemplateById } from "@/lib/vercel-templates";

export const maxDuration = 60;

const BASE_SYSTEM_PROMPT = `You are an expert UI engineer. When the user asks you to build a UI, respond with a single self-contained React component written in plain JSX (NO TypeScript — no type annotations, no interfaces, no generics).

HARD RULES:
1. The component MUST be named exactly "App" and be the last defined function.
2. Use only React hooks (useState, useEffect, useRef, useCallback) — they are global, do NOT import them.
3. Do NOT write any import or export statements.
4. Do NOT use TypeScript syntax (no :Type, no <T>, no interface, no type alias).
5. Use Tailwind CSS utility classes for all styling (loaded via CDN in the sandbox).
6. Wrap the entire component in a single \`\`\`jsx code block.
7. Make it visually polished — dark theme (#0a0a0f bg, white text), subtle gradients, rounded corners, realistic copy.
8. After the code block, write 1–2 sentences describing what was built and any interactive features.
9. When iterating on a previous design, carry forward ALL prior sections unless explicitly told to remove them.

TAILWIND TIPS:
- Prefer flex/grid layouts. Use gap-* for spacing.
- Use text-balance on headings. Use backdrop-blur for glassmorphism.
- Responsive: use sm:, md:, lg: prefixes freely.`;

function buildSystemPrompt(templateId?: string): string {
  if (!templateId) return BASE_SYSTEM_PROMPT;

  const template = getTemplateById(templateId);
  if (!template) return BASE_SYSTEM_PROMPT;

  return `${BASE_SYSTEM_PROMPT}

---
ACTIVE TEMPLATE CONTEXT — "${template.name}"
${template.systemPromptContext}

When building components or pages for this template:
- Follow the file structure and naming conventions described above.
- Use the tech stack: ${template.stack.join(", ")}.
- Mirror the architectural patterns (routing, data fetching, auth) from the template.
- Generate real, production-quality Next.js code — NOT a sandboxed React component — unless the user explicitly asks for a preview-only component.
- Structure your response as:
  1. A brief explanation of what you are building and which file it belongs to.
  2. The complete file content in a single code block with the correct language (tsx, ts, css).
  3. Any follow-up files needed (e.g. types, utilities) in separate code blocks.
  4. A concise summary of next steps.`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages: UIMessage[] = body.messages ?? [];
  const model: string = body.model ?? "openai/gpt-4.1";
  const templateId: string | undefined = body.templateId;

  const result = streamText({
    model,
    system: buildSystemPrompt(templateId),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
