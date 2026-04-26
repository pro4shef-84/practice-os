import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NoteCard from '@/components/notes/NoteCard'

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!therapist) notFound()

  // Fetch client (ownership enforced via therapist_id)
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('therapist_id', therapist.id)
    .single()

  if (!client) notFound()

  // Fetch sessions and notes in parallel
  const [{ data: sessions }, { data: notes }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, scheduled_at, duration_minutes, status, cpt_code, fee_charged, payment_status')
      .eq('client_id', clientId)
      .eq('therapist_id', therapist.id)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('notes')
      .select('id, session_id, template_type, is_signed, signed_at, created_at, updated_at')
      .eq('client_id', clientId)
      .eq('therapist_id', therapist.id)
      .order('created_at', { ascending: false }),
  ])

  const upcomingSessions = (sessions ?? []).filter(s =>
    s.status === 'scheduled' && new Date(s.scheduled_at) > new Date()
  )
  const pastSessions = (sessions ?? []).filter(s =>
    s.status !== 'scheduled' || new Date(s.scheduled_at) <= new Date()
  )

  const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No-show',
    late_cancel: 'Late cancel',
  }

  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'text-blue-700 bg-blue-50',
    completed: 'text-green-700 bg-green-50',
    cancelled: 'text-gray-500 bg-gray-100',
    no_show: 'text-red-700 bg-red-50',
    late_cancel: 'text-orange-700 bg-orange-50',
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Clients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{client.first_name} {client.last_name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Added {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {client.is_active ? '' : ' · Inactive'}
        </p>
      </div>

      {/* Contact info */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Email</dt>
            <dd className="text-gray-900">{client.email ?? <span className="text-gray-300">—</span>}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Phone</dt>
            <dd className="text-gray-900">{client.phone ?? <span className="text-gray-300">—</span>}</dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Date of birth</dt>
            <dd className="text-gray-900">
              {client.date_of_birth
                ? new Date(client.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : <span className="text-gray-300">—</span>
              }
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Diagnosis code</dt>
            <dd className="text-gray-900">{client.diagnosis_code ?? <span className="text-gray-300">—</span>}</dd>
          </div>
        </dl>
      </section>

      {/* Upcoming sessions */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming sessions</h2>
          <Link href="/schedule" className="text-xs text-indigo-600 hover:underline">View schedule</Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-center">
            <p className="text-gray-400 text-sm">No upcoming sessions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingSessions.map(session => (
              <div key={session.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' at '}
                    {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.duration_minutes} min</p>
                </div>
                <Link href={`/notes/${session.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                  Write note
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Session notes */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Session notes
            {notes && notes.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">{notes.length}</span>
            )}
          </h2>
        </div>
        {!notes || notes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-center">
            <p className="text-gray-400 text-sm">No notes yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>

      {/* Past sessions */}
      {pastSessions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Session history</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pastSessions.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-900">
                      {new Date(session.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[session.status] ?? 'text-gray-500 bg-gray-100'}`}>
                        {STATUS_LABELS[session.status] ?? session.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500">
                      {session.fee_charged
                        ? `$${(session.fee_charged / 100).toFixed(0)}`
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
