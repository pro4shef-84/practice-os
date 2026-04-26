// Daily caseload snapshot computation — Phase 6
// Called by Supabase pg_cron at midnight per therapist timezone

import type { Database } from '@/lib/types/database.types'

type SnapshotInsert = Database['public']['Tables']['caseload_snapshots']['Insert']

export async function computeSnapshot(_therapistId: string): Promise<SnapshotInsert> {
  // TODO: implement in Phase 6
  // 1. Count active clients (sessions in last 60 days)
  // 2. Get therapist capacity_max
  // 3. Compute utilization_pct
  // 4. Count at_risk clients (from risk_flags with resolved_at = null)
  // 5. Compute effective_hourly_rate (revenue / billable hours this month)
  throw new Error('computeSnapshot not yet implemented')
}
