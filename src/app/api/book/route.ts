// POST /api/book — public booking endpoint (no auth required)
// Creates a client record + session, triggers confirmation SMS
// Called from the public /book/[therapistSlug] page

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendSmsReminder } from '@/lib/utils/reminders'

const bookingSchema = z.object({
  therapist_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20),
  stripe_setup_intent_id: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const parsed = bookingSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = await createServiceClient()

  // Verify therapist exists
  const { data: therapist } = await supabase
    .from('therapists')
    .select('id, full_name, session_fee, cancellation_hours, phone, timezone')
    .eq('id', parsed.data.therapist_id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })

  // Check slot is still available
  const slotStart = new Date(parsed.data.scheduled_at)
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000) // +1hr buffer window

  const { data: conflict } = await supabase
    .from('sessions')
    .select('id')
    .eq('therapist_id', therapist.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date(slotStart.getTime() - 60 * 60 * 1000).toISOString())
    .lte('scheduled_at', slotEnd.toISOString())
    .maybeSingle()

  if (conflict) {
    return NextResponse.json({ error: 'This slot is no longer available. Please choose another time.' }, { status: 409 })
  }

  // Find existing client by phone, or create new one
  let clientId: string

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('therapist_id', therapist.id)
    .eq('phone', parsed.data.phone)
    .maybeSingle()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        therapist_id: therapist.id,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        email: parsed.data.email ?? null,
        phone: parsed.data.phone,
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      return NextResponse.json({ error: 'Failed to create client record.' }, { status: 500 })
    }
    clientId = newClient.id
  }

  // Create the session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      therapist_id: therapist.id,
      client_id: clientId,
      scheduled_at: parsed.data.scheduled_at,
      duration_minutes: 50,
      status: 'scheduled',
      cpt_code: '90837',
      fee_charged: therapist.session_fee ?? null,
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Failed to create session.' }, { status: 500 })
  }

  // Send confirmation SMS (non-blocking — don't fail booking if SMS fails)
  try {
    const { sid } = await sendSmsReminder(
      {
        id: session.id,
        scheduled_at: parsed.data.scheduled_at,
        duration_minutes: 50,
        client_first_name: parsed.data.first_name,
        client_phone: parsed.data.phone,
        therapist_first_name: therapist.full_name?.split(' ')[0] ?? '',
        therapist_phone: therapist.phone ?? '',
        cancellation_hours: therapist.cancellation_hours ?? 24,
      },
      'confirmation'
    )

    await supabase.from('reminders').insert({
      session_id: session.id,
      client_id: clientId,
      reminder_type: 'confirmation',
      sent_at: new Date().toISOString(),
      twilio_message_sid: sid,
      status: 'sent',
    })
  } catch {
    // SMS failure does not block booking
  }

  return NextResponse.json({ session_id: session.id }, { status: 201 })
}
