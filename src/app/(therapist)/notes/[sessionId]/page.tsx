import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NoteEditor from '@/components/notes/NoteEditor'
import SignButton from '@/components/notes/SignButton'
import AddendumForm from '@/components/notes/AddendumForm'
import type { Json } from '@/lib/types/database.types'

const DEFAULT_CONTENT: Record<string, Json> = {
  SOAP: { subjective: '', objective: '', assessment: '', si_hi_present: false, si_hi_details: '', plan: '' },
  DAP: { data: '', assessment: '', plan: '' },
  BIRP: { behavior: '', intervention: '', response: '', plan: '' },
  progress: { session_focus: '', progress_toward_goals: '', plan: '' },
}

const TEMPLATE_LABELS: Record<string, string> = {
  SOAP: 'SOAP note',
  DAP: 'DAP note',
  BIRP: 'BIRP note',
  progress: 'Progress note',
}

export default async function NoteEditorPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!therapist) notFound()

  // Fetch session — verify ownership
  const { data: session } = await supabase
    .from('sessions')
    .select('id, client_id, scheduled_at, duration_minutes, status')
    .eq('id', sessionId)
    .eq('therapist_id', therapist.id)
    .single()

  if (!session) notFound()

  // Fetch client
  const { data: client } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .eq('id', session.client_id)
    .eq('therapist_id', therapist.id)
    .single()

  // Fetch existing note for this session, or create a new one
  const { data: existingNote } = await supabase
    .from('notes')
    .select('*')
    .eq('session_id', sessionId)
    .eq('therapist_id', therapist.id)
    .maybeSingle()

  let note = existingNote

  if (!note) {
    // Create a new SOAP note draft (default template)
    const { data: created } = await supabase
      .from('notes')
      .insert({
        therapist_id: therapist.id,
        client_id: session.client_id,
        session_id: sessionId,
        template_type: 'SOAP',
        content: DEFAULT_CONTENT.SOAP,
      })
      .select()
      .single()

    note = created
  }

  if (!note) notFound()

  const sessionDate = new Date(session.scheduled_at)
  const templateType = note.template_type as 'SOAP' | 'DAP' | 'BIRP' | 'progress'

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={client ? `/clients/${client.id}` : '/notes'}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {client ? `${client.first_name} ${client.last_name}` : 'Notes'}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client ? `${client.first_name} ${client.last_name}` : 'Session note'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              {sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {' · '}
              {session.duration_minutes} min
              {' · '}
              {TEMPLATE_LABELS[templateType] ?? templateType}
            </p>
          </div>
          <SignButton noteId={note.id} isSigned={note.is_signed} />
        </div>
      </div>

      {/* Note editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <NoteEditor
          noteId={note.id}
          templateType={templateType}
          initialContent={(note.content ?? {}) as Record<string, unknown>}
          isSigned={note.is_signed}
          signedAt={note.signed_at}
        />
      </div>

      {/* Addendum section for signed notes */}
      {note.is_signed && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Add a timestamped addendum</h3>
          <p className="text-xs text-gray-400 mb-4">Addenda are appended to the signed note and cannot be edited after saving.</p>
          <AddendumForm noteId={note.id} />
        </div>
      )}
    </div>
  )
}
