import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  currentTool: z.enum(['simple_practice', 'therapy_notes', 'jane_app', 'multiple_tools', 'nothing']).optional(),
  biggestPain: z.enum(['notes', 'cancellations', 'intake', 'superbills', 'scheduling']).optional(),
  sessionsPerWeek: z.enum(['under_10', '10_to_15', '16_to_20', 'over_20']).optional(),
  switchTrigger: z.enum(['lower_price', 'auto_save_notes', 'cancellation_fees', 'simpler_intake', 'actively_looking']).optional(),
  urgency: z.enum(['shopping_now', 'open_not_urgent', 'happy']).optional(),
});

const labels = {
  currentTool: {
    simple_practice: 'SimplePractice',
    therapy_notes: 'TherapyNotes',
    jane_app: 'Jane App',
    multiple_tools: 'Multiple tools cobbled together',
    nothing: 'Nothing structured',
  } as Record<string, string>,
  biggestPain: {
    notes: 'Writing session notes',
    cancellations: 'Chasing cancellations & no-shows',
    intake: 'New client intake & paperwork',
    superbills: 'Superbills & billing',
    scheduling: 'Scheduling',
  } as Record<string, string>,
  sessionsPerWeek: {
    under_10: 'Under 10',
    '10_to_15': '10–15',
    '16_to_20': '16–20',
    over_20: 'Over 20',
  } as Record<string, string>,
  switchTrigger: {
    lower_price: 'Lower flat price',
    auto_save_notes: 'Notes that auto-save',
    cancellation_fees: 'Cancellation fees that enforce themselves',
    simpler_intake: 'Simpler client intake',
    actively_looking: "I'm already actively looking",
  } as Record<string, string>,
  urgency: {
    shopping_now: 'Actively shopping now',
    open_not_urgent: 'Open but not urgent',
    happy: 'Happy with current setup',
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

  const { email, currentTool, biggestPain, sessionsPerWeek, switchTrigger, urgency } = parsed.data;

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL ?? 'v.praveen.rao@gmail.com';

  if (!resendApiKey) {
    console.warn('[waitlist] RESEND_API_KEY not set — skipping email send');
    console.info('[waitlist] New signup (dev):', { email, currentTool, biggestPain, sessionsPerWeek, switchTrigger, urgency, timestamp });
    return NextResponse.json({ success: true });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(resendApiKey);

  const rows: string[] = [];
  let shaded = false;
  const addRow = (label: string, value: string) => {
    rows.push(row(label, value, shaded));
    shaded = !shaded;
  };
  addRow('Email', email);
  if (currentTool)      addRow('Current tool', labels.currentTool[currentTool] ?? currentTool);
  if (biggestPain)      addRow('Biggest pain', labels.biggestPain[biggestPain] ?? biggestPain);
  if (sessionsPerWeek)  addRow('Sessions/week', labels.sessionsPerWeek[sessionsPerWeek] ?? sessionsPerWeek);
  if (switchTrigger)    addRow('Switch trigger', labels.switchTrigger[switchTrigger] ?? switchTrigger);
  if (urgency)          addRow('Timeline', labels.urgency[urgency] ?? urgency);
  addRow('Signed up', timestamp);

  const subjectParts = [
    currentTool ? labels.currentTool[currentTool] : null,
    biggestPain ? labels.biggestPain[biggestPain] : null,
  ].filter(Boolean);
  const subject = subjectParts.length > 0
    ? `Waitlist: ${email} — ${subjectParts.join(' → ')}`
    : `Waitlist: ${email}`;

  const [notificationResult, confirmationResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'Practice OS Waitlist <waitlist@solopractice.app>',
      to: [notificationEmail],
      subject,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;">
          <h2 style="color:#2A7D5F;margin-bottom:16px;">New Practice OS signup</h2>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            ${rows.join('')}
          </table>
        </div>
      `,
    }),

    resend.emails.send({
      from: 'Practice OS <waitlist@solopractice.app>',
      to: [email],
      subject: "You're on the Practice OS waitlist",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;color:#111827;line-height:1.6;">
          <p>Thanks for joining.</p>
          <p>We read every response — yours helps us understand what to build first.</p>
          <p>We're in early development and will reach out directly before we open beta access.</p>
          <p style="color:#6b7280;font-size:13px;margin-top:32px;">
            — The Practice OS team
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

  console.info('[waitlist] Signup:', { email, currentTool, biggestPain, sessionsPerWeek, switchTrigger, urgency });

  return NextResponse.json({ success: true });
}
