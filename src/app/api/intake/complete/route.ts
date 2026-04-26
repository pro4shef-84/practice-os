// POST /api/intake/complete — client submits completed intake forms
// No auth required — token-based. Validates token, stores docs, updates client record.
// TODO: implement in Phase 3

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { completeIntakeSchema } from '@/lib/validation/api-schemas'

export async function POST(request: NextRequest) {
  // No auth check — this is the public token-based intake endpoint
  const parsed = completeIntakeSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // TODO: validate token exists + not expired, store documents, update client intake status
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
