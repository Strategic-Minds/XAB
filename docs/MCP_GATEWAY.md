# XAB MCP Gateway

## Endpoint
`https://xab-system.vercel.app/api/mcp/mcp`

Alternate (current Vercel URL):
`https://xab-system-[hash]-strategic-minds-advisory.vercel.app/api/mcp/mcp`

## Registration
To register with ChatGPT:
1. Go to ChatGPT > Settings > Connectors
2. Add custom connector
3. MCP URL: `https://xab-system.vercel.app/api/mcp/mcp`
4. Or use OpenAPI spec: `https://xab-system.vercel.app/api/mcp/tools`

## Tool Count: 37

### Namespaces
| Namespace | Tools | Description |
|---|---|---|
| xab.control | 2 | Health, bootstrap status |
| xab.build | 3 | Repo summary, file list, file read |
| xab.queue | 7 | Jobs, DLQ, requeue, universal runner |
| xab.sandbox | 2 | Create and destroy sandboxes |
| xab.quarantine | 2 | Quarantine and list threats |
| xab.swarm | 4 | Agent status, messages, kill switch |
| xab.playbooks | 2 | List and trigger playbooks |
| xab.audit | 3 | Score, findings, cron health |
| xab.drive | 5 | Drive operations (dry_run default) |
| xab.platform | 7 | GitHub, Vercel, AI Gateway provisioning |

### Governance
- All write operations default to `mode: dry_run`
- Pass `mode: execute` to run live
- Protected actions require approval phrase: `APPROVE [ACTION]`
- Kill switch requires: `APPROVE ARM KILL SWITCH`

### Legacy Compatibility
All 20 tools from `autobuilderos.com/api/mcp-minimal/mcp` are preserved with identical signatures. Existing ChatGPT connectors can be re-pointed to the XAB URL with zero changes.
