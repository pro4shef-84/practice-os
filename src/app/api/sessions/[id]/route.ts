import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSessionSchema } from '@/lib/validation/api-schemas'

// GET /api/sessions/[id] — fetch single session with client info
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

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('therapist_id', therapist.id)  // ownership check
    .single()

  if (error || !session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Fetch client separately to avoid join type issues
  const { data: client } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email, phone')
    .eq('id', session.client_id)
    .single()

  return NextResponse.json({ ...session, client: client ?? null })
}

// PATCH /api/sessions/[id] — update session status, fee, payment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateSessionSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check via WHERE therapist_id
  const { data, error } = await supabase
    .from('sessions')
    .update(parsed.data)
    .eq('id', id)
    .eq('therapist_id', therapist.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(data)
}
