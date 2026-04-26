// GET /api/caseload — get latest caseload snapshot + active risk flags for therapist
// TODO: implement in Phase 6

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
