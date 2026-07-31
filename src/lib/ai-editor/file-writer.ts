// XAB AI Frontend Editor — File Writer
// Writes files to FEATURE BRANCHES ONLY. Never touches main.
// Every write produces a receipt.

import type { EditPlan, EditReceipt, FileChange } from './types';
import crypto from 'crypto';

const REPO = 'Strategic-Minds/XAB';
const PROTECTED_BRANCHES = ['main'];

export function assertNotProtected(branch: string): void {
  if (PROTECTED_BRANCHES.includes(branch)) {
    throw new Error(`BLOCKED: Cannot write to protected branch '${branch}'. Use a feature branch.`);
  }
}

async function getOrCreateBranch(branchName: string, token: string): Promise<string> {
  // Try to get existing branch
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/git/refs/heads/${branchName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (getRes.ok) {
    const data = await getRes.json() as { object: { sha: string } };
    return data.object.sha;
  }

  // Branch doesn't exist — create from main
  const mainRes = await fetch(
    `https://api.github.com/repos/${REPO}/git/refs/heads/main`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const mainData = await mainRes.json() as { object: { sha: string } };
  const mainSha = mainData.object.sha;

  await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: mainSha })
  });

  return mainSha;
}

export async function executeEditPlan(plan: EditPlan): Promise<EditReceipt> {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) throw new Error('GITHUB_ACCESS_TOKEN not configured');

  assertNotProtected(plan.targetBranch);

  if (plan.requiresApproval) {
    throw new Error(`Edit plan '${plan.planId}' requires operator approval before execution.`);
  }

  // Get or create branch
  const branchSha = await getOrCreateBranch(plan.targetBranch, token);

  // Get tree SHA from current branch commit
  const commitRes = await fetch(
    `https://api.github.com/repos/${REPO}/git/commits/${branchSha}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const commitData = await commitRes.json() as { tree: { sha: string } };
  const treeSha = commitData.tree.sha;

  // Create blobs for each file change
  const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  for (const change of plan.files) {
    if (change.action === 'delete') {
      // For deletes, we don't add to tree (absence = deletion)
      continue;
    }

    const blobRes = await fetch(`https://api.github.com/repos/${REPO}/git/blobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: change.content ?? '', encoding: 'utf-8' })
    });
    const blobData = await blobRes.json() as { sha: string };

    treeItems.push({
      path: change.path,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha
    });
  }

  // Create tree
  const newTreeRes = await fetch(`https://api.github.com/repos/${REPO}/git/trees`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_tree: treeSha, tree: treeItems })
  });
  const newTree = await newTreeRes.json() as { sha: string };

  // Create commit
  const commitMessage = `ai-edit: ${plan.description}\n\nPlan: ${plan.planId}\nRationale: ${plan.rationale}\nRollback: ${plan.rollback}`;
  const newCommitRes = await fetch(`https://api.github.com/repos/${REPO}/git/commits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: commitMessage,
      tree: newTree.sha,
      parents: [branchSha]
    })
  });
  const newCommit = await newCommitRes.json() as { sha: string };

  // Update branch ref
  await fetch(`https://api.github.com/repos/${REPO}/git/refs/heads/${plan.targetBranch}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: newCommit.sha })
  });

  const receipt: EditReceipt = {
    receiptId: crypto.randomUUID(),
    planId: plan.planId,
    commitSha: newCommit.sha,
    branch: plan.targetBranch,
    filesChanged: plan.files.map(f => f.path),
    timestamp: new Date().toISOString(),
    rollbackRef: branchSha,
  };

  console.log('[XAB:AI-EDITOR:RECEIPT]', JSON.stringify(receipt));
  return receipt;
}
