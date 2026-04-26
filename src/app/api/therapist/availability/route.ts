import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertAvailabilitySchema } from '@/lib/validation/api-schemas'

// GET /api/therapist/availability — fetch own availability slots
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
    .from('availability')
    .select('day_of_week, start_time, end_time, is_active')
    .eq('therapist_id', therapist.id)
    .order('day_of_week')

  if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

  return NextResponse.json(data ?? [])
}

// PUT /api/therapist/availability — replace all availability slots
export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = upsertAvailabilitySchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete existing slots then insert new ones — atomic via delete+insert
  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .eq('therapist_id', therapist.id)

  if (deleteError) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  if (parsed.data.length === 0) return NextResponse.json([])

  const rows = parsed.data.map(slot => ({ ...slot, therapist_id: therapist.id }))

  const { data, error } = await supabase
    .from('availability')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })

  return NextResponse.json(data)
}
