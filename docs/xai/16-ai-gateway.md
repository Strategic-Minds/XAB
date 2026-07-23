# Xtreme AI Systems (XAI) AI Gateway Spec

## 1. Provider & Routing Architecture
To streamline LLM coordination, optimize latency, and log interactions, all agent LLM queries are funneled through the central Vercel AI Gateway.

*   **Endpoint:** `https://ai-gateway.vercel.sh/v1`
*   **Redundancy:** If the primary AI gateway fails, the system falls back to direct API access.

## 2. Standard Model Tiering
Agents must route queries to the correct model tier based on task complexity to minimize cost:

| Tier | Model Identifier | Intended Task Scope |
| :--- | :--- | :--- |
| **Fast** | `openai/gpt-4o-mini` | Simple classification, logging, small script generation, simple audit. |
| **Smart** | `openai/gpt-4o` | Webpack design extraction, complex code compilation, schema generation. |
| **Reason** | `openai/o4-mini` | Multiphase logic planning, cost anomaly calculation, security analysis. |
| **Embed** | `openai/text-embedding-3-small` | Vector embedding generation for search catalogs. |

## 3. Token Limits per Job Type
*   **Product/Service Discovery:** Max 4,000 prompt tokens / 1,000 completion tokens.
*   **Six-Option Generation:** Max 16,000 prompt tokens / 8,000 completion tokens.
*   **Frontend Compilation:** Max 32,000 prompt tokens / 16,000 completion tokens.
*   **Security Auditing:** Max 8,000 prompt tokens / 4,000 completion tokens.

## 4. Cost Governance Rules
*   **Per-Job Cost Tracking:** Every model API response must log the input tokens, output tokens, cost in USD, and corresponding `job_id`.
*   **API Key Redaction:** API keys must be completely redacted from all logging streams. The system automatically scrubs any log containing the prefix `sk-` or `ai-gateway-key`.
