// Risk flag detection heuristics — Phase 6
// Runs daily per therapist, inserts new risk_flags, resolves stale ones

export async function detectRiskFlags(_therapistId: string): Promise<void> {
  // TODO: implement in Phase 6
  // Flag a client if ANY of:
  // 1. cancellation_pattern: 2+ cancellations/no-shows in last 30 days
  // 2. cadence_drift: weekly→biweekly without therapist marking intentional
  // 3. long_gap: last session >3 weeks ago with no future session scheduled
  // 4. no_future_session: no session scheduled at all
  throw new Error('detectRiskFlags not yet implemented')
}
