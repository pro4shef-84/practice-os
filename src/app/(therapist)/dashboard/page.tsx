import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id, full_name, practice_name, session_fee, capacity_max')
    .eq('user_id', user!.id)
    .single()

  const therapistId = therapist?.id ?? ''

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  const [{ data: todaySessions }, { data: sessionClients }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, scheduled_at, duration_minutes, status, client_id')
      .eq('therapist_id', therapistId)
      .gte('scheduled_at', todayStart)
      .lt('scheduled_at', todayEnd)
      .eq('status', 'scheduled')
      .order('scheduled_at'),
    supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('therapist_id', therapistId),
  ])

  const clientMap = new Map(
    (sessionClients ?? []).map(c => [c.id, c])
  )

  const firstName = therapist?.full_name?.split(' ')[0] ?? 'there'
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Today&apos;s sessions</h2>
          <Link href="/schedule" className="text-sm text-indigo-600 hover:underline font-medium">
            View schedule
          </Link>
        </div>

        {!todaySessions || todaySessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">No sessions scheduled for today.</p>
            <Link href="/schedule" className="text-indigo-600 text-sm font-medium hover:underline mt-2 inline-block">
              Set up your availability →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map(session => {
              const client = clientMap.get(session.client_id)
              const time = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', hour12: true,
              })
              return (
                <div key={session.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client ? `${client.first_name} ${client.last_name}` : 'Unknown client'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{time} · {session.duration_minutes} min</p>
                  </div>
                  <Link
                    href={`/notes/${session.id}`}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Write note
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/clients/new"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Add a client</p>
            <p className="text-xs text-gray-500 mt-1">Send intake link automatically</p>
          </Link>

          <Link
            href="/notes"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Write a note</p>
            <p className="text-xs text-gray-500 mt-1">SOAP, DAP, BIRP templates</p>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Complete your profile</p>
            <p className="text-xs text-gray-500 mt-1">NPI, license, cancellation policy</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
