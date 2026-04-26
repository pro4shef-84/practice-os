import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const therapistId = therapist?.id ?? ''

  const [{ data: clients }, { data: intakeDocs }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, first_name, last_name, email, phone, is_active, created_at')
      .eq('therapist_id', therapistId)
      .eq('is_active', true)
      .order('last_name'),
    supabase
      .from('intake_documents')
      .select('client_id, document_type, signed_at')
      .eq('therapist_id', therapistId),
  ])

  const activeCount = clients?.length ?? 0

  function intakeStatus(clientId: string) {
    if (!intakeDocs) return 'not_sent'
    const docs = intakeDocs.filter(d => d.client_id === clientId)
    if (docs.length === 0) return 'not_sent'
    const consentSigned = docs.find(d => d.document_type === 'consent_to_treat' && d.signed_at)
    return consentSigned ? 'complete' : 'pending'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active {activeCount === 1 ? 'client' : 'clients'}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add client
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium text-sm">No clients yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first client to send them an intake link</p>
          <Link
            href="/clients/new"
            className="mt-4 inline-block bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Intake</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Added</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map(client => {
                const status = intakeStatus(client.id)
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{client.first_name} {client.last_name}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-gray-500">{client.email ?? '—'}</p>
                      {client.phone && <p className="text-gray-400 text-xs mt-0.5">{client.phone}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {status === 'complete' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Complete
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          Pending
                        </span>
                      )}
                      {status === 'not_sent' && (
                        <span className="text-xs font-medium text-gray-400">Not sent</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">
                        {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
