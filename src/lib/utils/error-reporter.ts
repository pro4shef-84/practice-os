// Client-side error reporting — Phase 7 (Polish)
// PHI rule: never include client names, diagnoses, or session details in error reports

export function reportError(error: Error, context: Record<string, unknown> = {}): void {
  // TODO: implement in Phase 7
  // Use a HIPAA-safe error reporting service (no FullStory/Hotjar on auth pages)
  // Only log: error message, component stack, route, timestamp — never PHI
  console.error('[error]', error.message, context)
}
