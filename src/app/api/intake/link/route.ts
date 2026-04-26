// POST /api/intake/link — generate a time-limited intake link for a new client
// Creates a token (uuid), stores with 72hr expiry, sends via email + SMS
// TODO: implement in Phase 3

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIntakeLinkSchema } from '@/lib/validation/api-schemas'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createIntakeLinkSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
