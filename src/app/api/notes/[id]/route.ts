import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateNoteSchema } from '@/lib/validation/api-schemas'
import type { Json } from '@/lib/types/database.types'

// GET /api/notes/[id] — fetch a single note (writes audit log)
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

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('therapist_id', therapist.id)  // ownership check
    .single()

  if (error || !note) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Audit log — HIPAA: every note view recorded
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    actor_type: 'therapist',
    action: 'viewed_note',
    resource_type: 'note',
    resource_id: note.id,
  })

  return NextResponse.json(note)
}

// PATCH /api/notes/[id] — auto-save note content (blocked if signed)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = updateNoteSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check + signed check
  const { data: existing } = await supabase
    .from('notes')
    .select('id, is_signed, therapist_id')
    .eq('id', id)
    .eq('therapist_id', therapist.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.is_signed) return NextResponse.json({ error: 'Note is signed and cannot be edited' }, { status: 403 })

  const { data, error } = await supabase
    .from('notes')
    .update({ content: parsed.data.content as Json, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(data)
}
