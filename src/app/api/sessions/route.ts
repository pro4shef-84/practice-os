import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSessionSchema } from '@/lib/validation/api-schemas'

// GET /api/sessions — list sessions for authenticated therapist
// Query params: start, end (ISO dates), status, client_id
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const status = searchParams.get('status')
  const clientId = searchParams.get('client_id')

  let query = supabase
    .from('sessions')
    .select('id, client_id, scheduled_at, duration_minutes, status, cpt_code, fee_charged, fee_collected, payment_status, cancellation_reason, cancelled_at, created_at')
    .eq('therapist_id', therapist.id)
    .order('scheduled_at', { ascending: true })

  if (start) query = query.gte('scheduled_at', start)
  if (end) query = query.lt('scheduled_at', end)
  const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show', 'late_cancel'] as const
  type SessionStatus = typeof validStatuses[number]
  if (status && (validStatuses as readonly string[]).includes(status)) {
    query = query.eq('status', status as SessionStatus)
  }
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

  return NextResponse.json(data ?? [])
}

// POST /api/sessions — create a session (therapist-side manual booking)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSessionSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id, session_fee')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check — client must belong to this therapist
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', parsed.data.client_id)
    .eq('therapist_id', therapist.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      therapist_id: therapist.id,
      client_id: parsed.data.client_id,
      scheduled_at: parsed.data.scheduled_at,
      duration_minutes: parsed.data.duration_minutes ?? 50,
      cpt_code: parsed.data.cpt_code ?? '90837',
      fee_charged: parsed.data.fee_charged ?? therapist.session_fee ?? null,
      status: 'scheduled',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Create failed' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
