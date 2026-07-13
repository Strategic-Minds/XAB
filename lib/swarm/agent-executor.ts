/**
 * XAB Agent Executor
 * Loads agent from Supabase, injects capability-based tools, runs GPT call.
 * Every agent response is written to xab_agent_messages table.
 */
import { streamText, tool, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

export interface XabAgent {
  id: string;
  agent_id: string;
  name: string;
  handle: string;
  avatar_color: string;
  avatar_emoji: string;
  tagline: string;
  personality_traits: string[];
  primary_skills: string[];
  system_prompt: string;
  preferred_model: string;
  temperature: number;
  autonomy_level: string;
  can_browse: boolean;
  can_generate_code: boolean;
  can_deploy: boolean;
  can_send_messages: boolean;
  memory_enabled: boolean;
}

// Browser/scraping tools (for Scout, Kai, Juno, Aria)
const browserTools = {
  scrapeUrl: tool({
    description: 'Scrape a URL and return its content, title, links, and metadata',
    parameters: z.object({
      url: z.string().url().describe('The URL to scrape'),
      extract: z.array(z.enum(['title','text','links','images','meta','headings'])).optional()
    }),
    execute: async ({ url, extract }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.autobuilderos.com'}/api/playwright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape', url, extract })
      });
      return res.json();
    }
  }),
  searchWeb: tool({
    description: 'Search the web and return top results with titles, URLs, and snippets',
    parameters: z.object({
      query: z.string().describe('Search query'),
      maxResults: z.number().min(1).max(10).default(5)
    }),
    execute: async ({ query, maxResults }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.autobuilderos.com'}/api/playwright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query, maxResults })
      });
      return res.json();
    }
  }),
  auditSeo: tool({
    description: 'Audit a URL for SEO: title, meta, headings, images, canonical, page speed',
    parameters: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.autobuilderos.com'}/api/playwright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seo_audit', url })
      });
      return res.json();
    }
  }),
  takeScreenshot: tool({
    description: 'Take a screenshot of a URL',
    parameters: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.autobuilderos.com'}/api/playwright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'screenshot', url })
      });
      return res.json();
    }
  }),
};

// Code generation tools (for Juno, Kai, Mira, XAB)
const codeTools = {
  generateCode: tool({
    description: 'Signal that code has been generated and should appear in the canvas panel',
    parameters: z.object({
      language: z.string(),
      filename: z.string(),
      description: z.string(),
      code: z.string()
    }),
    execute: async ({ language, filename, description, code }) => {
      return { canvas: true, language, filename, description, preview: code.slice(0, 200) + '...' };
    }
  }),
};

// Deployment tools (for Rex)
const deployTools = {
  checkGitHubCI: tool({
    description: 'Check the latest GitHub Actions CI status for a repo',
    parameters: z.object({
      repo: z.string().describe('e.g. Strategic-Minds/XAB'),
      branch: z.string().default('main')
    }),
    execute: async ({ repo, branch }) => {
      const token = process.env.GITHUB_TOKEN;
      const res = await fetch(`https://api.github.com/repos/${repo}/actions/runs?branch=${branch}&per_page=3`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      const d = await res.json();
      return d.workflow_runs?.slice(0,3).map((r: {name:string,status:string,conclusion:string,head_sha:string}) => ({
        name: r.name, status: r.status, conclusion: r.conclusion, sha: r.head_sha?.slice(0,10)
      })) ?? [];
    }
  }),
  getVercelDeployments: tool({
    description: 'Get recent Vercel deployments for a project',
    parameters: z.object({ projectId: z.string() }),
    execute: async ({ projectId }) => {
      const token = process.env.STRATEGIC_MINDS_TOKEN || process.env.VERCEL_TOKEN;
      const teamId = 'team_aFdds8lsbHMwe2ip4aQdbQ3d';
      const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      return d.deployments?.slice(0,5).map((dep: {state:string,url:string,createdAt:number}) => ({
        state: dep.state, url: dep.url, createdAt: new Date(dep.createdAt).toISOString()
      })) ?? [];
    }
  }),
};

// Messaging tools (for Aria)
const messagingTools = {
  draftMessage: tool({
    description: 'Draft a message for operator review before sending',
    parameters: z.object({
      channel: z.enum(['email','whatsapp','sms']),
      to: z.string(),
      subject: z.string().optional(),
      body: z.string()
    }),
    execute: async ({ channel, to, subject, body }) => {
      return { draft: true, channel, to, subject, body, status: 'AWAITING_APPROVAL', note: 'Show this draft to the operator before sending. Do not send until confirmed.' };
    }
  }),
};

// Validation tools (for Kai)
const validationTools = {
  checkRouteHealth: tool({
    description: 'Check if an API route is returning the expected status code',
    parameters: z.object({
      url: z.string().url(),
      expectedStatus: z.number().default(200),
      method: z.enum(['GET','POST','PUT','DELETE']).default('GET')
    }),
    execute: async ({ url, expectedStatus, method }) => {
      try {
        const res = await fetch(url, { method });
        const passed = res.status === expectedStatus;
        return { url, status: res.status, expected: expectedStatus, passed, timestamp: new Date().toISOString() };
      } catch (e) {
        return { url, status: 0, expected: expectedStatus, passed: false, error: String(e) };
      }
    }
  }),
  writeValidationReceipt: tool({
    description: 'Write a validation receipt to Supabase ValidationRegistry',
    parameters: z.object({
      test_type: z.string(),
      status: z.enum(['PASS','FAIL','SKIP']),
      score_awarded: z.number(),
      score_possible: z.number(),
      evidence: z.string()
    }),
    execute: async ({ test_type, status, score_awarded, score_possible, evidence }) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const body = {
        validation_type: test_type,
        validation_source: 'kai-agent',
        status,
        score: score_awarded,
        max_score: score_possible,
        evidence,
        run_at: new Date().toISOString()
      };
      await fetch(`${supabaseUrl}/rest/v1/ValidationRegistry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey!, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return { written: true, test_type, status, score_awarded, score_possible };
    }
  }),
};

function buildAgentTools(agent: XabAgent) {
  const tools: Record<string, ReturnType<typeof tool>> = {};
  if (agent.can_browse) Object.assign(tools, browserTools);
  if (agent.can_generate_code) Object.assign(tools, codeTools);
  if (agent.can_deploy) Object.assign(tools, deployTools);
  if (agent.can_send_messages) Object.assign(tools, messagingTools);
  // Kai always gets validation tools
  if (agent.name === 'Kai') Object.assign(tools, validationTools);
  return tools;
}

export async function executeAgentTurn(
  agentId: string,
  messages: CoreMessage[],
  supabase: SupabaseClient,
  conversationId?: string
) {
  // Load agent from Supabase
  const { data: agent, error } = await supabase
    .from('xab_agents')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error || !agent) {
    throw new Error(`Agent ${agentId} not found: ${error?.message}`);
  }

  const tools = buildAgentTools(agent as XabAgent);

  const result = streamText({
    model: openai(agent.preferred_model || 'gpt-4o'),
    system: agent.system_prompt,
    messages,
    tools: Object.keys(tools).length > 0 ? tools : undefined,
    temperature: agent.temperature || 0.7,
    maxSteps: 5,
    onFinish: async ({ text }) => {
      // Write message to xab_agent_messages for the chat UI to display
      if (conversationId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        await fetch(`${supabaseUrl}/rest/v1/xab_agent_messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey!,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            agent_id: agentId,
            agent_name: agent.name,
            agent_handle: agent.handle,
            agent_color: agent.avatar_color,
            role: 'assistant',
            content: text,
            created_at: new Date().toISOString()
          })
        });
      }
      // Update last_active_at
      await supabase.from('xab_agents').update({ last_active_at: new Date().toISOString(), total_messages: (agent.total_messages || 0) + 1 }).eq('agent_id', agentId);
    }
  });

  return result;
}