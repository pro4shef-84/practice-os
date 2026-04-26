import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateTherapistSchema } from '@/lib/validation/api-schemas'

// GET /api/therapist — fetch own therapist profile
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('therapists')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/therapist — update own therapist profile
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateTherapistSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Ownership is implicit — WHERE user_id = user.id
  const { data, error } = await supabase
    .from('therapists')
    .update(parsed.data)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    actor_type: 'therapist',
    action: 'updated_profile',
    resource_type: 'therapist',
    resource_id: data.id,
  })

  return NextResponse.json(data)
}
