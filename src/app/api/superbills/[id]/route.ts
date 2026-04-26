// GET /api/superbills/[id] — get superbill metadata + signed storage URL
// TODO: implement in Phase 4

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  void id
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
