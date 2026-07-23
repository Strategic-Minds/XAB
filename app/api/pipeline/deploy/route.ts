import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 120;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

export async function POST(req: NextRequest) {
  try {
    const { project_id } = await req.json() as { project_id: string };
    if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 });

    const supabase = await createClient();
    const { data: project, error: projErr } = await supabase
      .from('xai_projects').select('*').eq('id', project_id).single();

    if (projErr || !project) throw new Error('Project not found');

    const parsed = project.parsed_data as Record<string, unknown>;
    const repoName = slugify((parsed.business_name as string) ?? project.business_name);
    const githubToken = process.env.GITHUB_TOKEN ?? process.env.GITHUB_ACCESS_TOKEN ?? '';
    const vercelToken = process.env.VERCEL_TOKEN ?? '';
    const vercelTeamId = process.env.VERCEL_TEAM_ID ?? '';
    const driveToken = process.env.GOOGLE_DRIVE_TOKEN ?? '';
    const driveRootId = process.env.GOOGLE_DRIVE_ROOT_ID_41 ?? '';

    // 1. Create GitHub Repo
    let github_repo = '';
    let github_repo_id = '';
    const ghRes = await fetch('https://api.github.com/orgs/Strategic-Minds/repos', {
      method: 'POST',
      headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        description: `${parsed.business_name} — Built by XAB AutoBuilder`,
        private: false,
        auto_init: true,
      }),
    });
    if (ghRes.ok) {
      const ghData = await ghRes.json() as { full_name: string; id: number };
      github_repo = ghData.full_name;
      github_repo_id = String(ghData.id);
    }

    // 2. Create Vercel Project
    let vercel_url = '';
    const vRes = await fetch(`https://api.vercel.com/v9/projects?teamId=${vercelTeamId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: repoName,
        framework: 'nextjs',
        gitRepository: { type: 'github', repo: github_repo },
      }),
    });
    if (vRes.ok) {
      const vData = await vRes.json() as { id: string };
      vercel_url = `https://${repoName}.vercel.app`;
      console.log('[deploy] Vercel project created:', vData.id);
    }

    // 3. Create Google Drive Folder
    let drive_folder_id = '';
    const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${driveToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.business_name as string,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [driveRootId],
      }),
    });
    if (driveRes.ok) {
      const driveData = await driveRes.json() as { id: string };
      drive_folder_id = driveData.id;
    }

    // 4. Update project record
    await supabase.from('xai_projects').update({
      github_repo,
      github_repo_id,
      vercel_url,
      drive_folder_id,
      status: 'building',
    }).eq('id', project_id);

    // 5. Trigger site build
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xab-system.vercel.app';
    fetch(`${baseUrl}/api/pipeline/build-site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id, github_repo, parsed }),
    }).catch(console.error);

    return NextResponse.json({ success: true, project_id, github_repo, vercel_url, drive_folder_id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Deploy failed';
    console.error('[pipeline/deploy]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
