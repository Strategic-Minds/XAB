// XAB AI Frontend Editor — File Reader
// Reads frontend files from GitHub API for AI inspection

import type { FrontendFile } from './types';

const REPO = 'Strategic-Minds/XAB';

export async function readFile(path: string, branch = 'main'): Promise<FrontendFile | null> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('GITHUB_ACCESS_TOKEN not configured');

  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub API error: ${res.status} for ${path}`);
  }

  const data = await res.json() as { content: string; sha: string; path: string };
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  return { path: data.path, content, sha: data.sha, branch };
}

export async function listDirectory(dirPath: string, branch = 'main'): Promise<string[]> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('GITHUB_ACCESS_TOKEN not configured');

  const url = `https://api.github.com/repos/${REPO}/contents/${dirPath}?ref=${branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });

  if (!res.ok) return [];
  const items = await res.json() as Array<{ path: string; type: string }>;
  return items.map(i => i.path);
}

export async function readAllFrontendFiles(branch = 'main'): Promise<Record<string, string>> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('GITHUB_ACCESS_TOKEN not configured');

  // Get recursive tree
  const treeUrl = `https://api.github.com/repos/${REPO}/git/trees/refs/heads/${branch}?recursive=1`;
  const res = await fetch(treeUrl, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });

  if (!res.ok) throw new Error(`Failed to get tree: ${res.status}`);
  const tree = await res.json() as { tree: Array<{ path: string; type: string }> };

  // Filter to frontend-relevant files
  const frontendPaths = tree.tree
    .filter(f => f.type === 'blob')
    .filter(f =>
      f.path.startsWith('app/') ||
      f.path.startsWith('components/') ||
      f.path.startsWith('lib/') ||
      f.path === 'app/globals.css' ||
      f.path === 'tailwind.config.js'
    )
    .map(f => f.path);

  // Read up to 20 files (avoid rate limits)
  const files: Record<string, string> = {};
  for (const path of frontendPaths.slice(0, 20)) {
    const file = await readFile(path, branch);
    if (file) files[path] = file.content;
  }

  return files;
}
