import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const waitlistSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  yearsInPractice: z.enum(['planning', 'less_than_1', '1_to_3', '3_to_5', '5_plus'], {
    errorMap: () => ({ message: 'Please select how long you have been in solo practice' }),
  }),
  currentTool: z.enum(
    ['simple_practice', 'therapy_notes', 'google_docs', 'paper', 'nothing', 'other'],
    { errorMap: () => ({ message: 'Please select your current tool' }) }
  ),
  biggestPain: z.enum(
    ['no_shows', 'notes', 'intake', 'superbills', 'multiple_tools', 'other'],
    { errorMap: () => ({ message: 'Please select your biggest admin pain' }) }
  ),
  adminHours: z.enum(['less_2', '2_to_5', '5_to_10', 'over_10', 'unknown'], {
    errorMap: () => ({ message: 'Please select your weekly admin hours' }) ,
  }),
  openFeedback: z.string().max(2000).trim().optional(),
});

const labels = {
  yearsInPractice: {
    planning: 'Not yet — planning to go solo',
    less_than_1: 'Less than 1 year',
    '1_to_3': '1–3 years',
    '3_to_5': '3–5 years',
    '5_plus': '5+ years',
  } as Record<string, string>,
  currentTool: {
    simple_practice: 'SimplePractice',
    therapy_notes: 'TherapyNotes',
    google_docs: 'Google Docs / Sheets / Forms',
    paper: 'Paper charts + manual',
    nothing: 'Nothing formal yet',
    other: 'Something else',
  } as Record<string, string>,
  biggestPain: {
    no_shows: 'No-shows and chasing late cancel fees',
    notes: 'Writing session notes',
    intake: 'New client intake and paperwork',
    superbills: 'Creating superbills',
    multiple_tools: 'Juggling multiple tools',
    other: 'Something else',
  } as Record<string, string>,
  adminHours: {
    less_2: 'Less than 2 hours/week',
    '2_to_5': '2–5 hours/week',
    '5_to_10': '5–10 hours/week',
    over_10: 'More than 10 hours/week',
    unknown: 'Never tracked it',
  } as Record<string, string>,
};

function row(label: string, value: string, shaded: boolean): string {
  const bg = shaded ? 'background:#f9fafb;' : '';
  return `<tr style="${bg}">
    <td style="padding:8px 12px;font-weight:600;color:#374151;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;color:#111827;">${value}</td>
  </tr>`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Validation error';
    return NextResponse.json({ error: firstError }, { status: 422 });
  }

  const { firstName, email, yearsInPractice, currentTool, biggestPain, adminHours, openFeedback } =
    parsed.data;

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL ?? 'v.praveen.rao@gmail.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solopractice.app';

  if (!resendApiKey) {
    console.warn('[waitlist] RESEND_API_KEY not set — skipping email send');
    console.info('[waitlist] New signup (dev):', {
      firstName,
      email,
      yearsInPractice,
      currentTool,
      biggestPain,
      adminHours,
      openFeedback,
      timestamp,
    });
    return NextResponse.json({ success: true });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(resendApiKey);

  const tableRows = [
    row('Name', firstName, false),
    row('Email', email, true),
    row('Solo practice since', labels.yearsInPractice[yearsInPractice] ?? yearsInPractice, false),
    row('Current tool', labels.currentTool[currentTool] ?? currentTool, true),
    row('Biggest pain', labels.biggestPain[biggestPain] ?? biggestPain, false),
    row('Admin hrs/week', labels.adminHours[adminHours] ?? adminHours, true),
    row('Open feedback', openFeedback ?? '—', false),
    row('Signed up', timestamp, true),
  ].join('');

  const [notificationResult, confirmationResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'SoloPractice Waitlist <waitlist@solopractice.app>',
      to: [notificationEmail],
      subject: `Waitlist: ${firstName} — ${labels.currentTool[currentTool] ?? currentTool} → ${labels.biggestPain[biggestPain] ?? biggestPain}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;">
          <h2 style="color:#4338ca;margin-bottom:16px;">New SoloPractice signup</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            ${tableRows}
          </table>
        </div>
      `,
    }),

    resend.emails.send({
      from: 'SoloPractice <waitlist@solopractice.app>',
      to: [email],
      subject: "You're on the SoloPractice waitlist",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;color:#111827;line-height:1.6;">
          <p>Hi ${firstName},</p>
          <p>Thanks for joining. We read every response — yours helps us understand what to build first.</p>
          <p>We&apos;re in early development and will reach out directly before we open beta access.</p>
          <p>In the meantime, the free note templates (SOAP, DAP, BIRP) are here if you want them:<br/>
            <a href="${appUrl}/templates" style="color:#4338ca;">${appUrl}/templates</a>
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:32px;">
            — The SoloPractice team
          </p>
        </div>
      `,
    }),
  ]);

  if (notificationResult.status === 'rejected') {
    console.error('[waitlist] Failed to send notification email:', notificationResult.reason);
  }
  if (confirmationResult.status === 'rejected') {
    console.error('[waitlist] Failed to send confirmation email:', confirmationResult.reason);
  }

  console.info('[waitlist] Signup:', { firstName, email, currentTool, biggestPain, adminHours });

  return NextResponse.json({ success: true });
}
