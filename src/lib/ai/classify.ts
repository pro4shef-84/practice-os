// Fast classification via Claude Haiku — Phase 6 (Caseload Intelligence)
// Used for short labels, pattern categorisation, tooltip text
// PHI rule: never pass client names — session counts and patterns only

import { anthropic, MODELS } from './client'

export async function classifyCancellationPattern(
  recentCancellations: number,
  totalSessions: number
): Promise<string> {
  // TODO: implement in Phase 6
  throw new Error('classifyCancellationPattern not yet implemented')
}
