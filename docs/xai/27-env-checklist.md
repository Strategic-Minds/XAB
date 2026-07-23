# Xtreme AI Systems (XAI) Environment Checklist

## 1. Required Production Environment Variables
The following environment variables are mandatory in the production Vercel project:

*   `CRON_SECRET`: Required for verifying incoming cron heartbeats.
*   `SUPABASE_URL`: API endpoint of the production database.
*   `SUPABASE_SERVICE_ROLE_KEY`: Secret PostgreSQL role bypass token.
*   `NEXT_PUBLIC_SUPABASE_URL`: Public client database URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public client database key.
*   `SUPABASE_ANON_KEY`: Server-side client database key.
*   `BROWSER_WORKER_URL`: Endpoint of the browser engine (`https://browserworker.vercel.app`).
*   `BROWSER_WORKER_SECRET`: Secret token for accessing BrowserWorker.
*   `OPENAI_API_KEY`: API credential for accessing OpenAI via Vercel AI Gateway.
*   `RESEND_API_KEY`: Token for dispatching notification emails.
*   `VERCEL_AI_GATEWAY_KEY`: Access token for the Vercel AI Gateway.

## 2. Optional Recommended Variables
*   `SENTRY_DSN` & `NEXT_PUBLIC_SENTRY_DSN`: Real-time frontend exception capturing.
*   `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry tracing exporter destination.
*   `LOG_LEVEL`: Configures JSON logger output sensitivity (`DEBUG` | `INFO` | `WARN` | `ERROR`).

## 3. Storage Safety Rules
*   **Strict Security:** Never commit any of these environment variables to source code or git repositories.
*   **Enforcement:** Automated git commit hooks reject any file contenant secret keys or tokens.
