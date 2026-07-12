import { embed } from "ai";
import { gateway } from "ai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function chunkText(text: string, chunkSize = 512, overlap = 64): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    chunks.push(words.slice(start, end).join(" "));
    start += chunkSize - overlap;
  }

  return chunks.filter(c => c.trim().length > 20);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, content, source_url, doc_type = "text" } = body;

    if (!content || !title) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    // Save document record
    const { data: doc, error: docErr } = await supabase
      .from("knowledge_documents")
      .insert({
        user_id: user.id,
        title,
        content,
        source_url: source_url ?? null,
        doc_type,
        status: "processing",
      })
      .select("id")
      .single();

    if (docErr || !doc) {
      throw new Error(docErr?.message ?? "Failed to create knowledge document");
    }

    // Chunk the content
    const chunks = chunkText(content);

    // Embed each chunk using Vercel AI Gateway
    const chunkInserts = [];
    for (let i = 0; i < chunks.length; i++) {
      const { embedding } = await embed({
        model: gateway.textEmbeddingModel("openai/text-embedding-3-small"),
        value: chunks[i],
      });

      chunkInserts.push({
        knowledge_id: doc.id,
        content: chunks[i],
        embedding: JSON.stringify(embedding),
        chunk_index: i,
        token_count: chunks[i].split(/\s+/).length,
      });
    }

    // Batch insert chunks
    const { error: chunkErr } = await supabase
      .from("knowledge_chunks")
      .insert(chunkInserts);

    if (chunkErr) throw chunkErr;

    // Mark document as ready
    await supabase
      .from("knowledge_documents")
      .update({ status: "ready", chunk_count: chunks.length })
      .eq("id", doc.id);

    return NextResponse.json({
      id: doc.id,
      chunks: chunks.length,
      status: "ready",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ingestion failed";
    console.error("[XAB] Knowledge ingest error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
