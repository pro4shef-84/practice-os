import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateClientSchema } from '@/lib/validation/api-schemas'

// GET /api/clients/[id] — fetch single client with sessions and notes
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch client (ownership check via therapist_id)
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('therapist_id', therapist.id)
    .single()

  if (error || !client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch sessions and notes separately (avoids join type issues)
  const [{ data: sessions }, { data: notes }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, scheduled_at, duration_minutes, status, cpt_code, fee_charged, payment_status')
      .eq('client_id', id)
      .eq('therapist_id', therapist.id)
      .order('scheduled_at', { ascending: false }),
    supabase
      .from('notes')
      .select('id, session_id, template_type, is_signed, signed_at, created_at, updated_at')
      .eq('client_id', id)
      .eq('therapist_id', therapist.id)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({ ...client, sessions: sessions ?? [], notes: notes ?? [] })
}

// PATCH /api/clients/[id] — update client details
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateClientSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check via WHERE therapist_id
  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', id)
    .eq('therapist_id', therapist.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(data)
}
