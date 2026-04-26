// POST /api/reminders — Vercel cron trigger (every 30 minutes)
// Finds sessions where a reminder is due and sends SMS via Twilio
// Reminder windows: confirmation (on booking), 48hr, 24hr, 2hr before

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSmsReminder } from '@/lib/utils/reminders'

type ReminderType = '48hr' | '24hr' | '2hr' | 'confirmation'

interface ReminderWindow {
  type: ReminderType
  hoursBeforeMin: number
  hoursBeforeMax: number
}

const WINDOWS: ReminderWindow[] = [
  { type: '48hr', hoursBeforeMin: 47, hoursBeforeMax: 49 },
  { type: '24hr', hoursBeforeMin: 23, hoursBeforeMax: 25 },
  { type: '2hr',  hoursBeforeMin: 1,  hoursBeforeMax: 3  },
]

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const now = new Date()
  const results: { sessionId: string; type: string; status: 'sent' | 'skipped' | 'error'; reason?: string }[] = []

  for (const window of WINDOWS) {
    const windowStart = new Date(now.getTime() + window.hoursBeforeMin * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + window.hoursBeforeMax * 60 * 60 * 1000)

    // Find scheduled sessions in this window
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, scheduled_at, duration_minutes, therapist_id, client_id')
      .eq('status', 'scheduled')
      .gte('scheduled_at', windowStart.toISOString())
      .lte('scheduled_at', windowEnd.toISOString())

    if (!sessions || sessions.length === 0) continue

    for (const session of sessions) {
      // Check if this reminder type was already sent
      const { data: existing } = await supabase
        .from('reminders')
        .select('id')
        .eq('session_id', session.id)
        .eq('reminder_type', window.type)
        .maybeSingle()

      if (existing) {
        results.push({ sessionId: session.id, type: window.type, status: 'skipped', reason: 'already sent' })
        continue
      }

      // Fetch client and therapist for SMS content
      const [{ data: client }, { data: therapist }] = await Promise.all([
        supabase.from('clients').select('first_name, phone').eq('id', session.client_id).single(),
        supabase.from('therapists').select('full_name, phone, cancellation_hours').eq('id', session.therapist_id).single(),
      ])

      if (!client?.phone) {
        results.push({ sessionId: session.id, type: window.type, status: 'skipped', reason: 'no client phone' })
        continue
      }

      try {
        const { sid } = await sendSmsReminder(
          {
            id: session.id,
            scheduled_at: session.scheduled_at,
            duration_minutes: session.duration_minutes,
            client_first_name: client.first_name ?? 'there',
            client_phone: client.phone,
            therapist_first_name: therapist?.full_name?.split(' ')[0] ?? '',
            therapist_phone: therapist?.phone ?? '',
            cancellation_hours: therapist?.cancellation_hours ?? 24,
          },
          window.type
        )

        // Log to reminders table
        await supabase.from('reminders').insert({
          session_id: session.id,
          client_id: session.client_id,
          reminder_type: window.type,
          sent_at: now.toISOString(),
          twilio_message_sid: sid,
          status: 'sent',
        })

        results.push({ sessionId: session.id, type: window.type, status: 'sent' })
      } catch (err) {
        results.push({
          sessionId: session.id,
          type: window.type,
          status: 'error',
          reason: err instanceof Error ? err.message : 'unknown',
        })
      }
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
