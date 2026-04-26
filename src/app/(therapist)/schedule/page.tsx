import { createClient } from '@/lib/supabase/server'
import WeekCalendar from '@/components/scheduling/WeekCalendar'
import Link from 'next/link'

// Get Monday of the week containing `date`
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const therapistId = therapist?.id ?? ''

  // Determine which week to show (default: current week starting Monday)
  const today = new Date()
  const weekStart = week ? new Date(week + 'T00:00:00') : getWeekStart(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  // Prev/next week navigation dates
  const prevWeek = new Date(weekStart)
  prevWeek.setDate(weekStart.getDate() - 7)
  const nextWeek = new Date(weekStart)
  nextWeek.setDate(weekStart.getDate() + 7)

  const toDateParam = (d: Date) => d.toISOString().split('T')[0]

  // Fetch sessions for this week
  const [{ data: sessions }, { data: clients }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, client_id, scheduled_at, duration_minutes, status')
      .eq('therapist_id', therapistId)
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at'),
    supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('therapist_id', therapistId),
  ])

  const clientMap = new Map((clients ?? []).map(c => [c.id, c]))

  const enrichedSessions = (sessions ?? []).map(s => ({
    ...s,
    client_name: (() => {
      const c = clientMap.get(s.client_id)
      return c ? `${c.first_name} ${c.last_name}` : undefined
    })(),
  }))

  const isCurrentWeek = getWeekStart(today).toDateString() === weekStart.toDateString()

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
    ' – ' +
    new Date(weekEnd.getTime() - 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isCurrentWeek && (
            <Link
              href="/schedule"
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Today
            </Link>
          )}
          <Link
            href={`/schedule?week=${toDateParam(prevWeek)}`}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link
            href={`/schedule?week=${toDateParam(nextWeek)}`}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {enrichedSessions.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-amber-700">
            No sessions this week.{' '}
            {therapistId && (
              <Link href={`/book/${therapistId}`} target="_blank" className="font-medium underline">
                Share your booking link →
              </Link>
            )}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <WeekCalendar
          sessions={enrichedSessions}
          weekStart={weekStart.toISOString().split('T')[0]}
        />
      </div>

      {/* Booking link section */}
      {therapistId && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Your booking link</h2>
          <p className="text-xs text-gray-400 mb-3">Share this link with clients to book sessions</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate">
              {process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.com'}/book/{therapistId}
            </code>
            <Link
              href={`/book/${therapistId}`}
              target="_blank"
              className="text-xs font-medium text-indigo-600 hover:underline whitespace-nowrap"
            >
              Preview →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
