// At-risk client plain-language explanation — Phase 6 (Caseload Intelligence)
// Explains WHY a client is flagged in therapist language
// PHI rule: never pass client names — use client_id and session patterns only

import { anthropic, MODELS } from './client'

export type FlagType = 'cancellation_pattern' | 'cadence_drift' | 'long_gap' | 'no_future_session'

export interface RiskSummaryInput {
  flagType: FlagType
  recentCancellations?: number
  daysSinceLastSession?: number
  previousCadence?: string   // e.g. "weekly"
  currentCadence?: string    // e.g. "biweekly"
}

export async function explainRiskFlag(input: RiskSummaryInput): Promise<string> {
  // TODO: implement in Phase 6
  throw new Error('explainRiskFlag not yet implemented')
}
