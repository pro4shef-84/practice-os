// POST /api/webhooks/twilio — inbound SMS handler
// Handles CANCEL replies from clients — checks cancellation window, charges if late

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { chargeLateCancel } from '@/lib/utils/reminders'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const params = new URLSearchParams(body)

  const from = params.get('From')       // client's phone number
  const messageBody = params.get('Body')?.trim().toUpperCase() ?? ''

  // Only handle CANCEL replies
  if (messageBody !== 'CANCEL') {
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  if (!from) {
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }

  const supabase = await createServiceClient()

  // Find the client by phone number
  const { data: client } = await supabase
    .from('clients')
    .select('id, therapist_id, stripe_customer_id, stripe_payment_method_id')
    .eq('phone', from)
    .maybeSingle()

  if (!client) {
    return buildTwimlResponse("We couldn't find your appointment. Please contact your therapist directly.")
  }

  // Find their next scheduled session
  const { data: session } = await supabase
    .from('sessions')
    .select('id, scheduled_at, therapist_id')
    .eq('client_id', client.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(1)
    .maybeSingle()

  if (!session) {
    return buildTwimlResponse("You don't have any upcoming appointments scheduled.")
  }

  // Fetch therapist cancellation policy
  const { data: therapist } = await supabase
    .from('therapists')
    .select('cancellation_hours, late_cancel_fee')
    .eq('id', session.therapist_id)
    .single()

  const cancellationHours = therapist?.cancellation_hours ?? 24
  const lateCancelFee = therapist?.late_cancel_fee ?? 0

  const now = new Date()
  const sessionTime = new Date(session.scheduled_at)
  const hoursUntilSession = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isLateCancel = hoursUntilSession < cancellationHours

  if (isLateCancel && lateCancelFee > 0 && client.stripe_customer_id && client.stripe_payment_method_id) {
    // Charge late cancel fee
    try {
      const { paymentIntentId } = await chargeLateCancel(
        client.stripe_customer_id,
        client.stripe_payment_method_id,
        lateCancelFee,
        session.id
      )

      await supabase.from('sessions').update({
        status: 'late_cancel',
        cancelled_at: now.toISOString(),
        cancellation_reason: 'Client replied CANCEL via SMS',
        payment_status: 'paid',
        fee_collected: lateCancelFee,
        stripe_payment_intent_id: paymentIntentId,
      }).eq('id', session.id)

      const feeDisplay = `$${(lateCancelFee / 100).toFixed(0)}`
      return buildTwimlResponse(
        `Your appointment has been cancelled. A late cancel fee of ${feeDisplay} has been charged to your card on file per your therapist's cancellation policy.`
      )
    } catch {
      // If charge fails, still cancel but flag for therapist
      await supabase.from('sessions').update({
        status: 'late_cancel',
        cancelled_at: now.toISOString(),
        cancellation_reason: 'Client replied CANCEL via SMS (charge failed)',
        payment_status: 'pending',
      }).eq('id', session.id)

      return buildTwimlResponse(
        `Your appointment has been cancelled. There was an issue processing the late cancel fee — your therapist will follow up.`
      )
    }
  } else {
    // Free cancellation
    await supabase.from('sessions').update({
      status: 'cancelled',
      cancelled_at: now.toISOString(),
      cancellation_reason: 'Client replied CANCEL via SMS',
      payment_status: 'waived',
    }).eq('id', session.id)

    return buildTwimlResponse(`Your appointment has been cancelled. No charge will be applied.`)
  }
}

function buildTwimlResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0"?><Response><Message>${message}</Message></Response>`
  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
