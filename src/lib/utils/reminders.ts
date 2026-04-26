// Twilio SMS reminder sender
// PHI rule: no diagnosis, no session type, no therapist last name in message body

import type { Database } from '@/lib/types/database.types'

type ReminderType = Database['public']['Tables']['reminders']['Row']['reminder_type']

interface SessionForReminder {
  id: string
  scheduled_at: string
  duration_minutes: number
  client_first_name: string
  client_phone: string
  therapist_first_name: string
  therapist_phone: string
  cancellation_hours: number
}

function buildMessage(type: ReminderType, session: SessionForReminder): string {
  const scheduledAt = new Date(session.scheduled_at)
  const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dayStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const cutoffDate = new Date(scheduledAt.getTime() - session.cancellation_hours * 60 * 60 * 1000)
  const cutoffStr = cutoffDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  switch (type) {
    case 'confirmation':
      return `Hi ${session.client_first_name}, your appointment is confirmed for ${dayStr} at ${timeStr}. Reply CANCEL to cancel.`
    case '48hr':
      return `Hi ${session.client_first_name}, reminder: you have an appointment in 2 days on ${dayStr} at ${timeStr}. Reply CANCEL to cancel for free.`
    case '24hr':
      return `Hi ${session.client_first_name}, your appointment is tomorrow at ${timeStr}. Need to cancel? Reply CANCEL (free until ${cutoffStr} today). After that, a late cancel fee applies.`
    case '2hr':
      return `Hi ${session.client_first_name}, your appointment is in 2 hours at ${timeStr}. See you soon.`
  }
}

export async function sendSmsReminder(
  session: SessionForReminder,
  type: ReminderType
): Promise<{ sid: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromPhone) {
    throw new Error('Twilio env vars not configured')
  }

  if (!session.client_phone) {
    throw new Error('Client has no phone number')
  }

  const body = buildMessage(type, session)

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: session.client_phone,
        From: fromPhone,
        Body: body,
      }).toString(),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Twilio error: ${err}`)
  }

  const json = await res.json()
  return { sid: json.sid as string }
}

// Charge a late cancel fee via Stripe
export async function chargeLateCancel(
  stripeCustomerId: string,
  stripePaymentMethodId: string,
  amountCents: number,
  sessionId: string
): Promise<{ paymentIntentId: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured')

  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: String(amountCents),
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: 'true',
      off_session: 'true',
      description: `Late cancel fee — session ${sessionId}`,
    }).toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Stripe error: ${err}`)
  }

  const json = await res.json()
  return { paymentIntentId: json.id as string }
}
