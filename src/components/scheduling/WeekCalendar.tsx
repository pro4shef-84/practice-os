'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Session {
  id: string
  client_id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  client_name?: string
}

interface Props {
  sessions: Session[]
  weekStart: string // ISO date of Monday of the displayed week
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  completed: 'bg-green-50 border-green-200 text-green-800',
  cancelled: 'bg-gray-50 border-gray-200 text-gray-500',
  no_show: 'bg-red-50 border-red-200 text-red-700',
  late_cancel: 'bg-orange-50 border-orange-200 text-orange-700',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WeekCalendar({ sessions, weekStart }: Props) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const startDate = new Date(weekStart + 'T00:00:00')

  // Build 7-day grid
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  // Map sessions to their day index
  const sessionsByDay = new Map<number, Session[]>()
  for (const session of sessions) {
    const sessionDate = new Date(session.scheduled_at)
    const dayIdx = days.findIndex(d =>
      d.getFullYear() === sessionDate.getFullYear() &&
      d.getMonth() === sessionDate.getMonth() &&
      d.getDate() === sessionDate.getDate()
    )
    if (dayIdx >= 0) {
      const list = sessionsByDay.get(dayIdx) ?? []
      list.push(session)
      sessionsByDay.set(dayIdx, list)
    }
  }

  const today = new Date()

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          return (
            <div key={i} className="text-center">
              <p className="text-xs text-gray-400 font-medium">{DAY_LABELS[day.getDay()]}</p>
              <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mt-1 ${
                isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
              }`}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Session columns */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((_, dayIdx) => {
          const daySessions = (sessionsByDay.get(dayIdx) ?? [])
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

          return (
            <div key={dayIdx} className="min-h-24 space-y-1">
              {daySessions.map(session => {
                const time = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit',
                })
                const colorClass = STATUS_COLORS[session.status] ?? STATUS_COLORS.scheduled

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm ${colorClass}`}
                  >
                    <p className="font-semibold truncate">{session.client_name ?? '—'}</p>
                    <p className="opacity-70">{time}</p>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState(session.status)

  const time = new Date(session.scheduled_at).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }) + ' at ' + new Date(session.scheduled_at).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        ...(newStatus === 'cancelled' || newStatus === 'late_cancel'
          ? { cancelled_at: new Date().toISOString() }
          : {}),
      }),
    })
    if (res.ok) {
      setStatus(newStatus)
    }
    setUpdating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-semibold text-gray-900">{session.client_name ?? 'Unknown client'}</p>
            <p className="text-sm text-gray-500 mt-0.5">{time} · {session.duration_minutes} min</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <Link
            href={`/notes/${session.id}`}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write note
          </Link>

          {status === 'scheduled' && (
            <>
              <button
                onClick={() => updateStatus('completed')}
                disabled={updating}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-60"
              >
                Mark complete
              </button>
              <button
                onClick={() => updateStatus('no_show')}
                disabled={updating}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                Mark no-show
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                Cancel session
              </button>
            </>
          )}

          {status !== 'scheduled' && (
            <div className="px-4 py-2.5 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-500">
                Status: <span className="font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
