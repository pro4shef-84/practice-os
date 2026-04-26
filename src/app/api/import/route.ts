// POST /api/import — process SimplePractice CSV upload
// Parses clients + sessions CSV, previews rows, imports on confirm
// TODO: implement in Phase 6

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
