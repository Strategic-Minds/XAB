import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workflowId = searchParams.get("workflow_id");

  let query = supabase
    .from("crm_workflow_runs")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(20);

  if (workflowId) query = query.eq("workflow_id", workflowId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
