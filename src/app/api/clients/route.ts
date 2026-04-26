import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClientSchema } from '@/lib/validation/api-schemas'

// GET /api/clients — list all active clients for the authenticated therapist
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email, phone, date_of_birth, is_active, created_at')
    .eq('therapist_id', therapist.id)
    .eq('is_active', true)
    .order('last_name')

  if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

  return NextResponse.json(data ?? [])
}

// POST /api/clients — create a new client
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createClientSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, therapist_id: therapist.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Create failed' }, { status: 500 })

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    actor_type: 'therapist',
    action: 'created_client',
    resource_type: 'client',
    resource_id: data.id,
  })

  return NextResponse.json(data, { status: 201 })
}
