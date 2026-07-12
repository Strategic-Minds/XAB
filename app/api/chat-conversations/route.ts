import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([]);

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("id, title, model, pinned, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[XAB] GET /api/chat-conversations error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title = "New Conversation", model = "gpt-4o" } = body;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title, model })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[XAB] POST /api/chat-conversations error:", err);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
