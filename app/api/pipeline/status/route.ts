import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 10;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project_id = searchParams.get('project_id');
    if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('xai_projects')
      .select('id, business_name, niche, location, status, approved_image_url, github_repo, vercel_url, drive_folder_id, created_at')
      .eq('id', project_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const statusMessages: Record<string, string> = {
      pending_image: '🎨 Generating hero image...',
      pending_approval: '📧 Awaiting your approval email',
      approved: '🔨 Building your website...',
      building: '⚡ Deploying to Vercel...',
      live: '✅ Your website is live!',
      rejected: '❌ Rejected — start a new request',
    };

    return NextResponse.json({
      project_id: data.id,
      business_name: data.business_name,
      niche: data.niche,
      location: data.location,
      status: data.status,
      status_message: statusMessages[data.status] ?? data.status,
      image_url: data.approved_image_url,
      github_repo: data.github_repo,
      vercel_url: data.vercel_url,
      drive_folder_id: data.drive_folder_id,
      created_at: data.created_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
