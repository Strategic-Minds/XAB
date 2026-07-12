/**
 * XAB MCP Tool Registry
 * 37 canonical tools across 11 namespaces
 * Governance: protected tools require APPROVE phrase before execution
 */
export interface MCPTool {
  id: string;
  name: string;
  namespace: string;
  description: string;
  isProtected: boolean;
  requiresApproval: boolean;
  status: 'designed' | 'built' | 'tested' | 'live';
}

export const MCP_TOOLS: MCPTool[] = [
  // xab.control
  { id:'T-001', name:'system.status', namespace:'xab.control', description:'Get full XAB system health and activation score', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-002', name:'system.health_check', namespace:'xab.control', description:'Run 14-step heartbeat validation', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-003', name:'system.kill_switch_trigger', namespace:'xab.control', description:'Trigger a named kill switch — halts subsystem immediately', isProtected:true, requiresApproval:true, status:'designed' },
  { id:'T-004', name:'system.kill_switch_reset', namespace:'xab.control', description:'Reset a kill switch after incident resolution', isProtected:true, requiresApproval:true, status:'designed' },
  // xab.build
  { id:'T-005', name:'build.create_project', namespace:'xab.build', description:'Scaffold a new client project from template', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-006', name:'build.deploy_preview', namespace:'xab.build', description:'Trigger Vercel preview deployment for a branch', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-007', name:'build.generate_component', namespace:'xab.build', description:'AI-generate a React component from a prompt', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-008', name:'build.run_validation', namespace:'xab.build', description:'Run build, type-check, lint, and test suite', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.data
  { id:'T-009', name:'data.seed_records', namespace:'xab.data', description:'Seed entity records into Supabase', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-010', name:'data.embed_document', namespace:'xab.data', description:'Chunk and embed a document into rag_chunks', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-011', name:'data.semantic_search', namespace:'xab.data', description:'Vector similarity search via match_chunks()', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-012', name:'data.export_dataset', namespace:'xab.data', description:'Export entity records as JSON/CSV', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.chat
  { id:'T-013', name:'chat.send_message', namespace:'xab.chat', description:'Send a message to an agent chat room', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-014', name:'chat.create_room', namespace:'xab.chat', description:'Create a new multi-agent chat room', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-015', name:'chat.list_rooms', namespace:'xab.chat', description:'List all active chat rooms', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-016', name:'chat.get_history', namespace:'xab.chat', description:'Get durable message history for a room', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.intel
  { id:'T-017', name:'intel.scrape_competitor', namespace:'xab.intel', description:'Scrape and summarize a competitor site', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-018', name:'intel.market_report', namespace:'xab.intel', description:'Generate a market intelligence report', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-019', name:'intel.lead_score', namespace:'xab.intel', description:'Score a lead based on ICP criteria', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.finance
  { id:'T-020', name:'finance.create_invoice', namespace:'xab.finance', description:'Generate a client invoice', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-021', name:'finance.track_spend', namespace:'xab.finance', description:'Log and track AI and infrastructure spend', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-022', name:'finance.budget_check', namespace:'xab.finance', description:'Check current spend against budget cap', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.validation
  { id:'T-023', name:'validate.run_suite', namespace:'xab.validation', description:'Run full validation suite against a project', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-024', name:'validate.score_project', namespace:'xab.validation', description:'Score a project 0-100 across all dimensions', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-025', name:'validate.check_build', namespace:'xab.validation', description:'Run build check and return errors/warnings', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.release
  { id:'T-026', name:'release.create_pr', namespace:'xab.release', description:'Create a GitHub PR from a feature branch', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-027', name:'release.merge_branch', namespace:'xab.release', description:'Merge a branch to main — PROTECTED: requires APPROVE MERGE TO MAIN', isProtected:true, requiresApproval:true, status:'designed' },
  { id:'T-028', name:'release.tag_version', namespace:'xab.release', description:'Tag a release version in GitHub', isProtected:true, requiresApproval:true, status:'designed' },
  // xab.admin
  { id:'T-029', name:'admin.register_agent', namespace:'xab.admin', description:'Register a new agent in the agents table', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-030', name:'admin.get_feature_flags', namespace:'xab.admin', description:'Read all feature flags and their states', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-031', name:'admin.set_feature_flag', namespace:'xab.admin', description:'Enable or disable a feature flag — PROTECTED', isProtected:true, requiresApproval:false, status:'designed' },
  // xab.xps
  { id:'T-032', name:'xps.create_site', namespace:'xab.xps', description:'Create a new XPS client site scaffold', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-033', name:'xps.deploy_site', namespace:'xab.xps', description:'Deploy a client site to Vercel', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-034', name:'xps.get_site_status', namespace:'xab.xps', description:'Get build and deploy status for a client site', isProtected:false, requiresApproval:false, status:'designed' },
  // xab.mcp
  { id:'T-035', name:'mcp.list_tools', namespace:'xab.mcp', description:'List all available MCP tools with schema', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-036', name:'mcp.call_tool', namespace:'xab.mcp', description:'Call a named MCP tool with input', isProtected:false, requiresApproval:false, status:'designed' },
  { id:'T-037', name:'mcp.register_tool', namespace:'xab.mcp', description:'Register a new tool in the MCP registry', isProtected:false, requiresApproval:false, status:'designed' },
];

export const PROTECTED_TOOLS = MCP_TOOLS.filter(t => t.isProtected).map(t => t.id);
export const REQUIRES_APPROVAL = MCP_TOOLS.filter(t => t.requiresApproval).map(t => t.id);
export const NAMESPACES = [...new Set(MCP_TOOLS.map(t => t.namespace))];

export function getTool(id: string): MCPTool | undefined {
  return MCP_TOOLS.find(t => t.id === id || t.name === id);
}

export function getToolsByNamespace(ns: string): MCPTool[] {
  return MCP_TOOLS.filter(t => t.namespace === ns);
}
