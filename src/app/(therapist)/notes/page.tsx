import { createClient } from '@/lib/supabase/server'
import NoteCard from '@/components/notes/NoteCard'
import Link from 'next/link'

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const therapistId = therapist?.id ?? ''

  const [{ data: notes }, { data: clients }] = await Promise.all([
    supabase
      .from('notes')
      .select('id, session_id, client_id, template_type, is_signed, signed_at, created_at, updated_at')
      .eq('therapist_id', therapistId)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('therapist_id', therapistId)
      .eq('is_active', true)
      .order('last_name'),
  ])

  const clientMap = new Map((clients ?? []).map(c => [c.id, c]))

  const draftCount = notes?.filter(n => !n.is_signed).length ?? 0
  const totalCount = notes?.length ?? 0

  // Group notes by client_id
  const notesByClient = (notes ?? []).reduce((acc, note) => {
    const list = acc.get(note.client_id) ?? []
    list.push(note)
    acc.set(note.client_id, list)
    return acc
  }, new Map<string, NonNullable<typeof notes>>())

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session notes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} {totalCount === 1 ? 'note' : 'notes'}
            {draftCount > 0 && <span className="text-amber-600"> · {draftCount} unsigned</span>}
          </p>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium text-sm">No notes yet</p>
          <p className="text-gray-400 text-sm mt-1">Start a note from a client&apos;s profile or from today&apos;s sessions on the dashboard</p>
          <Link href="/clients" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
            Go to clients →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(notesByClient.entries()).map(([clientId, clientNotes]) => {
            const client = clientMap.get(clientId)
            return (
              <div key={clientId}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">
                    {client ? `${client.first_name} ${client.last_name}` : 'Unknown client'}
                  </h2>
                  {client && (
                    <Link href={`/clients/${clientId}`} className="text-xs text-indigo-600 hover:underline">
                      View client
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {clientNotes.map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
