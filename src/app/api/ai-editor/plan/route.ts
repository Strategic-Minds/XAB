import { NextRequest, NextResponse } from 'next/server';
import { executeEditPlan } from '@/lib/ai-editor/file-writer';
import type { EditPlan } from '@/lib/ai-editor/types';

// AI Frontend Editor — Plan execution endpoint
// The AI posts an EditPlan here to make changes to a feature branch
// NEVER modifies main. Always produces a receipt.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let plan: EditPlan;
  try {
    plan = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  // Safety: never allow writing to main
  if (!plan.targetBranch || plan.targetBranch === 'main') {
    return NextResponse.json(
      { error: 'targetBranch must be a feature branch, not main' },
      { status: 400 }
    );
  }

  // Safety: requiresApproval check
  if (plan.requiresApproval) {
    return NextResponse.json(
      { error: 'This edit plan requires operator approval', planId: plan.planId },
      { status: 202 }
    );
  }

  try {
    const receipt = await executeEditPlan(plan);
    return NextResponse.json({ ok: true, receipt });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
