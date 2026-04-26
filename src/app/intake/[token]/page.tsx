// TODO: Phase 3 — token-based intake completion (no auth required)
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <div>Intake form (token: {token}) — coming in Phase 3</div>
}
