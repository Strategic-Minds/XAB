import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { parsed: Record<string, unknown> };
    const { parsed } = body;
    if (!parsed) return NextResponse.json({ error: 'parsed project data required' }, { status: 400 });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('xai_projects')
      .insert({
        business_name: parsed.business_name as string,
        niche: parsed.niche as string,
        location: parsed.location as string,
        parsed_data: parsed,
        image_prompt: parsed.image_prompt as string,
        status: 'pending_image',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, project_id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Create failed';
    console.error('[pipeline/create]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
