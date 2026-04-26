// POST /api/superbills — generate a superbill PDF for a completed session
// TODO: implement in Phase 4

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSuperbillSchema } from '@/lib/validation/api-schemas'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = generateSuperbillSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
