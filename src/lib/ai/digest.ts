// Weekly digest generation — Phase 6 (Caseload Intelligence)
// Generates "Your practice this week" narrative via Claude Sonnet
// PHI rule: never pass client names or diagnoses — use client_id only

import { anthropic, MODELS } from './client'

export interface DigestInput {
  therapistId: string
  practiceFirstName: string
  activeCount: number
  capacityMax: number
  atRiskCount: number
  newFlagsThisWeek: number
  effectiveHourlyRate: number | null  // in cents
  noShowCostThisMonth: number | null  // in cents
  sessionCountThisWeek: number
}

export async function generateWeeklyDigest(input: DigestInput): Promise<string> {
  // TODO: implement in Phase 6
  throw new Error('generateWeeklyDigest not yet implemented')
}
