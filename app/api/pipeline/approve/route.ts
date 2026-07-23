import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get('project_id');
    const action = searchParams.get('action');

    if (!project_id || !action) {
      return NextResponse.json({ error: 'project_id and action required' }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === 'reject') {
      await supabase.from('xai_projects').update({ status: 'rejected' }).eq('id', project_id);
      return new NextResponse(
        '<html><body style="font-family:Arial;text-align:center;padding:60px;background:#0f172a;color:#f1f5f9;"><h1>❌ Rejected</h1><p>Project has been rejected. Start a new request to try again.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action === 'approve') {
      await supabase.from('xai_projects').update({ status: 'approved' }).eq('id', project_id);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xab-system.vercel.app';

      // Trigger deploy in background
      fetch(`${baseUrl}/api/pipeline/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id }),
      }).catch(console.error);

      return new NextResponse(
        `<html><body style="font-family:Arial;text-align:center;padding:60px;background:#0f172a;color:#f1f5f9;"><h1 style="color:#10b981;">✅ Approved!</h1><p style="color:#94a3b8;">Building your website now. You'll receive an email at jeremy@strategicmindsai.com when it's live.</p><p style="color:#475569;font-size:13px;">Project ID: ${project_id}</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Approve failed';
    console.error('[pipeline/approve]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
