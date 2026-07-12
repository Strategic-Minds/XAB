/**
 * XAB Financial Refresh — runs daily at 6am
 * Refreshes XPS product pricing, market intelligence
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = `FIN-${Date.now()}`;
  const supabase = createClient();
  const results: Record<string, unknown> = {};

  // Check XPS product observations needing refresh
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { count } = await supabase
      .from('xps_products')
      .select('*', { count: 'exact', head: true })
      .lt('observed_date', sevenDaysAgo);
    results.products_needing_refresh = count ?? 0;
  } catch (e) { results.product_check_error = String(e); }

  // Queue refresh jobs for stale products
  try {
    const jobId = `JOB-FIN-${runId}`;
    await supabase.from('job_queue').insert({
      job_id: jobId,
      queue_name: 'research',
      job_type: 'XPS_PRICE_REFRESH',
      priority: 4,
      payload: { trigger: 'financial_refresh_cron', run_id: runId },
      idempotency_key: `fin-refresh-${Math.floor(Date.now() / 86400000)}`,
      timeout_seconds: 600,
    });
    results.refresh_job_queued = jobId;
  } catch (e) { results.queue_error = String(e); }

  return NextResponse.json({ status: 'scheduled', run_id: runId, results });
}