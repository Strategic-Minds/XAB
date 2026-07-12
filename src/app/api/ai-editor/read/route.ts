import { NextRequest, NextResponse } from 'next/server';
import { readFile, listDirectory } from '@/lib/ai-editor/file-reader';

// AI Frontend Editor — Read endpoint
// The AI uses this to inspect current frontend files before proposing edits

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  const dir = searchParams.get('dir');
  const branch = searchParams.get('branch') ?? 'main';

  // Internal auth — only the XAB system itself calls this
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (dir) {
    const files = await listDirectory(dir, branch);
    return NextResponse.json({ dir, branch, files });
  }

  if (!path) {
    return NextResponse.json({ error: 'path or dir required' }, { status: 400 });
  }

  const file = await readFile(path, branch);
  if (!file) {
    return NextResponse.json({ error: 'file not found', path }, { status: 404 });
  }

  return NextResponse.json(file);
}
