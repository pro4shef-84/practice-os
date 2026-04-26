// TODO: Phase 5 — client portal layout
// Magic link authenticated, minimal nav (Appointments, Documents, Messages, Billing)
export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
