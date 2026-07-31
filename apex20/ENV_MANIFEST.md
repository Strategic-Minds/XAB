# APEX-20 Environment Variable Manifest
# Generated: 2026-07-13 | B44-09
# Source SHA-256: 437c926f0b8f9813

## ALREADY SET (verified in Vercel/sandbox)
NEXT_PUBLIC_SUPABASE_URL=https://azajysheebfhyzoyplpf.supabase.co   # VERIFIED
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set>                                   # VERIFIED
SUPABASE_SERVICE_ROLE_KEY=<set>                                        # VERIFIED
CRON_SECRET=<set>                                                       # VERIFIED (5/5 routes)
GITHUB_TOKEN=<set>                                                      # VERIFIED

## OPERATOR REQUIRED — Jeremy must enter these manually
# 1. OpenAI API Key
#    Where: platform.openai.com → API Keys → Create new secret key
OPENAI_API_KEY=REQUIRED

# 2. Anthropic API Key
#    Where: console.anthropic.com → Account → API Keys
ANTHROPIC_API_KEY=REQUIRED

# 3. Vercel AI Gateway Key
#    Where: vercel.com → Your Project → AI → Gateways → Access Tokens
VERCEL_AI_GATEWAY_KEY=REQUIRED

# 4. Google Workspace Service Account
#    Where: console.cloud.google.com → IAM & Admin → Service Accounts → Create → Download JSON
GOOGLE_SERVICE_ACCOUNT_JSON=REQUIRED

# 5. Analytics Write Key (optional — for Segment/Posthog)
ANALYTICS_WRITE_KEY=OPTIONAL

# 6. Error monitoring DSN (optional — for Sentry)
SENTRY_DSN=OPTIONAL
