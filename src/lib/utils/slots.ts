// Slot calculation for public booking page
// Reads therapist availability + existing sessions → returns open ISO datetime slots

import { createClient } from '@/lib/supabase/server'

export interface Slot {
  iso: string       // ISO 8601 datetime in therapist's timezone-aware UTC
  display: string   // "Mon, Apr 28 at 2:00 PM"
}

const SESSION_DURATION = 50  // minutes
const BUFFER_MINUTES = 10    // gap between sessions

// Returns available slots for the next `weeksAhead` weeks
export async function getAvailableSlots(therapistId: string, weeksAhead = 4): Promise<Slot[]> {
  const supabase = await createClient()

  const [{ data: availability }, { data: therapist }] = await Promise.all([
    supabase
      .from('availability')
      .select('day_of_week, start_time, end_time, is_active')
      .eq('therapist_id', therapistId)
      .eq('is_active', true),
    supabase
      .from('therapists')
      .select('timezone, session_fee')
      .eq('id', therapistId)
      .single(),
  ])

  if (!availability || availability.length === 0) return []

  const timezone = therapist?.timezone ?? 'America/New_York'
  const now = new Date()
  const slots: Slot[] = []

  // Generate slots for each day in the next `weeksAhead` weeks
  for (let dayOffset = 1; dayOffset <= weeksAhead * 7; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)

    const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
    const avail = availability.find(a => a.day_of_week === dayOfWeek)
    if (!avail) continue

    const [startH, startM] = avail.start_time.split(':').map(Number)
    const [endH, endM] = avail.end_time.split(':').map(Number)

    // Build candidate slot times for this day
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    let slotMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM - SESSION_DURATION

    while (slotMinutes <= endMinutes) {
      const h = Math.floor(slotMinutes / 60)
      const m = slotMinutes % 60
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`

      // Build an ISO string — treat the date+time as local to therapist timezone
      // For slot display we use a simple approach: create a Date assuming the slot
      // is in the therapist's local wall-clock time
      const slotIso = `${dateStr}T${timeStr}`

      slots.push({
        iso: slotIso,
        display: formatSlotDisplay(dateStr, h, m),
      })

      slotMinutes += SESSION_DURATION + BUFFER_MINUTES
    }
  }

  // Fetch existing booked sessions in the window to filter out taken slots
  const windowEnd = new Date(now)
  windowEnd.setDate(windowEnd.getDate() + weeksAhead * 7 + 1)

  const { data: booked } = await supabase
    .from('sessions')
    .select('scheduled_at, duration_minutes')
    .eq('therapist_id', therapistId)
    .in('status', ['scheduled'])
    .gte('scheduled_at', now.toISOString())
    .lt('scheduled_at', windowEnd.toISOString())

  if (!booked || booked.length === 0) return slots

  // Filter out slots that overlap with any booked session
  return slots.filter(slot => {
    const slotStart = new Date(slot.iso).getTime()
    const slotEnd = slotStart + SESSION_DURATION * 60 * 1000

    return !booked.some(b => {
      const bookedStart = new Date(b.scheduled_at).getTime()
      const bookedEnd = bookedStart + (b.duration_minutes + BUFFER_MINUTES) * 60 * 1000
      // Overlap check
      return slotStart < bookedEnd && slotEnd > bookedStart
    })
  })
}

function formatSlotDisplay(dateStr: string, h: number, m: number): string {
  const date = new Date(`${dateStr}T00:00:00`)
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const ampm = h < 12 ? 'AM' : 'PM'
  const minStr = m === 0 ? '' : `:${String(m).padStart(2, '0')}`
  return `${dayStr} at ${hour12}${minStr} ${ampm}`
}
