// POST /api/webhooks/stripe — Stripe webhook handler
// Events: setup_intent.succeeded → save payment method to client
//         payment_intent.succeeded → mark session payment as paid

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!sig || !webhookSecret || !stripeSecretKey) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
  }

  const rawBody = await request.text()

  // Verify Stripe signature using Web Crypto (no SDK needed)
  const isValid = await verifyStripeSignature(rawBody, sig, webhookSecret)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const supabase = await createServiceClient()

  switch (event.type) {
    case 'setup_intent.succeeded': {
      // Client completed card setup — save payment method
      const setupIntent = event.data.object
      const clientId = setupIntent.metadata?.client_id as string | undefined
      const paymentMethodId = setupIntent.payment_method as string | undefined

      if (clientId && paymentMethodId) {
        // Attach payment method to customer and save to client record
        await supabase
          .from('clients')
          .update({ stripe_payment_method_id: paymentMethodId })
          .eq('id', clientId)
      }
      break
    }

    case 'payment_intent.succeeded': {
      // Late cancel fee charged — find session and mark paid
      const paymentIntent = event.data.object
      const sessionId = paymentIntent.metadata?.session_id as string | undefined

      if (sessionId) {
        await supabase
          .from('sessions')
          .update({
            payment_status: 'paid',
            fee_collected: paymentIntent.amount_received as number,
          })
          .eq('id', sessionId)
          .eq('stripe_payment_intent_id', paymentIntent.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      // Therapist subscription cancelled — could flag account but keep data
      // No action needed for MVP — therapist data is never deleted
      break
    }
  }

  return NextResponse.json({ received: true })
}

// Verify Stripe webhook signature without the Stripe SDK
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = sigHeader.split(',').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=')
      acc[k] = v
      return acc
    }, {})

    const timestamp = parts['t']
    const signature = parts['v1']

    if (!timestamp || !signature) return false

    const signedPayload = `${timestamp}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

    return expected === signature
  } catch {
    return false
  }
}
