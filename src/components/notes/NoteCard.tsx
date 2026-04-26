import Link from 'next/link'

interface Props {
  note: {
    id: string
    session_id: string
    template_type: string
    is_signed: boolean
    signed_at: string | null
    created_at: string
    updated_at: string
  }
  clientId?: string
}

const TEMPLATE_LABELS: Record<string, string> = {
  SOAP: 'SOAP',
  DAP: 'DAP',
  BIRP: 'BIRP',
  progress: 'Progress note',
}

export default function NoteCard({ note, clientId: _clientId }: Props) {
  const date = new Date(note.created_at)
  const label = TEMPLATE_LABELS[note.template_type] ?? note.template_type

  return (
    <Link
      href={`/notes/${note.session_id}`}
      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-gray-400">{label}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {note.is_signed && note.signed_at
            ? `Signed ${new Date(note.signed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'Draft'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {note.is_signed ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Signed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            Draft
          </span>
        )}
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
