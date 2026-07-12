import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = user.id;

  const [leads, contacts, workflows, agents, knowledge, funnels, outreach, content] =
    await Promise.all([
      supabase.from("leads").select("id, status, value, created_at").eq("user_id", uid),
      supabase.from("contacts").select("id").eq("user_id", uid),
      supabase.from("crm_workflows").select("id, status, runs").eq("user_id", uid),
      supabase.from("crm_agents").select("id, status, runs").eq("user_id", uid),
      supabase.from("knowledge_documents").select("id").eq("user_id", uid),
      supabase.from("funnels").select("id, status, total_visits, total_conversions, revenue").eq("user_id", uid),
      supabase.from("outreach_sequences").select("id, status, enrolled, sent").eq("user_id", uid),
      supabase.from("content_items").select("id, status").eq("user_id", uid),
    ]);

  const leadsData = leads.data ?? [];
  const workflowsData = workflows.data ?? [];
  const agentsData = agents.data ?? [];
  const funnelsData = funnels.data ?? [];
  const outreachData = outreach.data ?? [];

  const totalRevenue = funnelsData.reduce((a, f) => a + (Number(f.revenue) || 0), 0);
  const totalLeadValue = leadsData.reduce((a, l) => a + (Number(l.value) || 0), 0);
  const wonLeads = leadsData.filter(l => l.status === "won").length;
  const activeWorkflows = workflowsData.filter(w => w.status === "active").length;
  const totalRuns = workflowsData.reduce((a, w) => a + (w.runs || 0), 0) +
                    agentsData.reduce((a, a2) => a + (a2.runs || 0), 0);
  const activeFunnels = funnelsData.filter(f => f.status === "active").length;
  const totalVisits = funnelsData.reduce((a, f) => a + (f.total_visits || 0), 0);
  const totalConversions = funnelsData.reduce((a, f) => a + (f.total_conversions || 0), 0);

  return NextResponse.json({
    totalLeads: leadsData.length,
    totalContacts: contacts.data?.length ?? 0,
    wonLeads,
    totalLeadValue,
    totalRevenue,
    activeWorkflows,
    workflowsTotal: workflowsData.length,
    totalAgents: agentsData.length,
    totalRuns,
    knowledgeDocs: knowledge.data?.length ?? 0,
    activeFunnels,
    totalFunnels: funnelsData.length,
    totalVisits,
    totalConversions,
    conversionRate: totalVisits > 0 ? ((totalConversions / totalVisits) * 100).toFixed(1) : "0",
    totalEnrolled: outreachData.reduce((a, s) => a + (s.enrolled || 0), 0),
    totalSent: outreachData.reduce((a, s) => a + (s.sent || 0), 0),
    publishedContent: content.data?.filter(c => c.status === "published").length ?? 0,
    totalContent: content.data?.length ?? 0,
  });
}
