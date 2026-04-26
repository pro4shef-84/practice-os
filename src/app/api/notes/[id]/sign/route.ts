import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Json } from '@/lib/types/database.types'

const addendumSchema = z.object({
  addendum: z.string().min(1).max(5000).optional(),
})

// POST /api/notes/[id]/sign — sign and lock note (irreversible)
// Optional body: { addendum: "..." } — appended to existing content, not replacing it
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = addendumSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!therapist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Ownership check
  const { data: note } = await supabase
    .from('notes')
    .select('id, is_signed, content, therapist_id')
    .eq('id', id)
    .eq('therapist_id', therapist.id)
    .single()

  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (note.is_signed) return NextResponse.json({ error: 'Note is already signed' }, { status: 409 })

  const now = new Date().toISOString()

  // If addendum provided, append it to content before signing
  const baseContent = (note.content ?? {}) as Record<string, Json>
  let finalContent: Json = baseContent
  if (parsed.data.addendum) {
    const existingAddenda = Array.isArray(baseContent.addenda) ? baseContent.addenda : []
    finalContent = {
      ...baseContent,
      addenda: [...existingAddenda, { text: parsed.data.addendum, added_at: now }],
    }
  }

  const { data, error } = await supabase
    .from('notes')
    .update({
      is_signed: true,
      signed_at: now,
      content: finalContent,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Sign failed' }, { status: 500 })

  // Audit log — HIPAA: every sign event recorded
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    actor_type: 'therapist',
    action: 'signed_note',
    resource_type: 'note',
    resource_id: note.id,
  })

  return NextResponse.json(data)
}
