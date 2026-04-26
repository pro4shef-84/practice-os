import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNoteSchema } from '@/lib/validation/api-schemas'

// GET /api/notes — list notes for the authenticated therapist
// Query params: client_id, session_id (optional filters)
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
  const clientId = searchParams.get('client_id')
  const sessionId = searchParams.get('session_id')

  let query = supabase
    .from('notes')
    .select('id, session_id, client_id, template_type, is_signed, signed_at, created_at, updated_at')
    .eq('therapist_id', therapist.id)
    .order('created_at', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)
  if (sessionId) query = query.eq('session_id', sessionId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })

  return NextResponse.json(data ?? [])
}

// POST /api/notes — create a new note draft
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createNoteSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check — verify client belongs to this therapist
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', parsed.data.client_id)
    .eq('therapist_id', therapist.id)
    .single()

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('notes')
    .insert({
      therapist_id: therapist.id,
      client_id: parsed.data.client_id,
      session_id: parsed.data.session_id,
      template_type: parsed.data.template_type,
      content: parsed.data.content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Create failed' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
