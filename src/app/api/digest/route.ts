// POST /api/digest — cron trigger for weekly digest generation + delivery
// Called every Friday at 9am therapist local time via Vercel cron
// Generates narrative with Claude Sonnet, sends via Resend
// TODO: implement in Phase 6

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
