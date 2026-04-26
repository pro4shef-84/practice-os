# Practice OS — CLAUDE.md
## Project context for agentic development. Read this fully before writing any code.

---

## WHAT WE ARE BUILDING

**Practice OS** is a solo practice management SaaS built exclusively for one-person therapy practices in the US. Tagline: "Practice management built for one."

**The pitch:** SimplePractice has the features. We have them too — built only for solo practices, with notes that actually auto-save, cancellation fees that enforce themselves, and no hidden transaction fees eating your revenue. Same job done better, at a price that makes sense for one person.

**Why therapists switch from SimplePractice:**
- SP doubled prices in early 2025 (now $69–99/mo + 3.15% per transaction + $0.25/claim)
- SP has no auto-save on notes — therapists lose progress notes regularly
- SP is built for group practices — solo therapists pay for features they never touch
- SP introduced controversial data privacy ToS changes in 2023; trust is damaged
- SP customer support is effectively non-existent (no public phone number)

**The customer:** Licensed solo therapist (LCSW, LPC, MFT, psychologist) in private practice, 2–10 years in, seeing 15–25 clients/week, generating $80K–$250K/year, no employees. Time-scarce (6–8 clients/day). Technically capable but uncomfortable with business/sales language.

**Priority signal:** Feature build order is driven by Reddit upvote evidence from r/therapists (200K members) + r/smallbusiness, cross-referenced against SimplePractice's known execution failures. Highest validated pain = built first.

**Language rule — non-negotiable:** Every label, tooltip, and message must use therapist language, not business language.
- "Sign and lock note" — not "submit documentation"
- "Clients who might be pulling back" — not "churn risk"
- "Your cancellation policy" — not "late cancel fee enforcement"
- "Your practice this week" — not "your dashboard"

**Pricing:** $79/month flat. No per-transaction fees. No feature tiers. No surprises.

---

## THE FEATURES — BUILD IN THIS ORDER

Feature order is determined by Reddit upvote signal strength + SimplePractice execution failures. Highest pain, highest evidence = built first.

---

### Feature 1: Structured Note Templates
**Reddit signal: 1,995 upvotes** (r/therapists warning against AI notes) + notes = #1 stated burnout source
**SP execution failure:** No auto-save — therapists lose notes. Slow load times. Inflexible templates.
**Our answer:** Structured fields (not free-text), auto-save on every keystroke, fast, no AI recording.

- Template types: SOAP, DAP, BIRP, Progress Note
- Each template has labeled structured fields — not one big text box
- **Auto-save on every keystroke** (this alone is a switch trigger from SimplePractice)
- Draft is auto-saved; therapist clicks "Sign and lock" when complete
- Once signed: read-only, timestamped. Therapist can add a timestamped addendum but cannot edit
- One note per session. Notes are scoped to a session
- Visible to therapist only — never to client
- Every note view writes to `audit_logs`
- No AI recording, no transcription. Therapist controls all input

**SOAP fields:** Subjective (client's mood, presenting concerns), Objective (therapist observations), Assessment (clinical impression, SI/HI check), Plan (interventions, homework, next session focus)
**DAP fields:** Data (reported + observed), Assessment (interpretation), Plan (next steps)
**BIRP fields:** Behavior (presenting concerns), Intervention (techniques used), Response (client's response), Plan (next session focus)
**Progress Note:** Simplified narrative — session focus, progress toward goals, plan

---

### Feature 2: Scheduling + SMS Reminders + Cancellation Enforcement
**Reddit signal: 1,429 upvotes** ("we are not emotional ATMs") + **658 upvotes** (SMS cuts no-shows 50%) + **647 upvotes** (income unpredictability)
**SP execution failure:** Cancellation enforcement exists but clunky to configure. No-show rate still high.
**Our answer:** 5-minute setup, SMS sequence that runs itself, late cancel fee charged automatically — therapist never has the awkward conversation.

- Therapist sets: weekly availability, session duration (default 50 min), buffer (default 10 min), cancellation window (default 24hr), late cancel fee (in dollars)
- Unique public booking URL: `/book/[therapistSlug]`
- Client books: name, email, phone, slot selection, card capture via Stripe Setup Intent (saved, not charged yet)
- SMS sequence via Twilio:
  - On booking: "Hi [first name], confirmed with [therapist first name] on [day] at [time]. Reply CANCEL to cancel."
  - 48hr before: "Reminder: appointment tomorrow at [time]. Reply CANCEL to cancel for free."
  - 24hr before: "Appointment tomorrow at [time]. Need to cancel? Reply CANCEL (free until [cutoff])."
  - 2hr before: "Your appointment is in 2 hours. See you soon."
- Cancel flow: client replies CANCEL or clicks link in SMS
  - Within free window: cancelled, slot freed, no charge
  - Within late cancel window: fee auto-charged to card on file, therapist notified via email
  - Therapist can manually waive fee from dashboard
- Therapist calendar: week view, click session for details, mark complete (triggers superbill), mark no-show

---

### Feature 3: Digital Intake + Consent Package
**Signal:** Setup complexity = #1 stated barrier to going solo. 2–3 hours per new client without automation.
**SP execution failure:** Intake exists but embedded in SP's complex UI — clients get confused, don't complete.
**Our answer:** One link, mobile-optimized, zero friction, card captured at the end.

- Therapist configures intake package once in Settings:
  1. Consent to Treatment
  2. Telehealth Consent
  3. Cancellation & Late Cancel Policy
  4. Client Intake Questionnaire (presenting concerns, history, medications, emergency contact)
  5. Credit Card Authorization
- Therapist can customize text of each document
- New client flow: therapist adds client (name + email + phone) → system generates time-limited intake link (72hr expiry) → sent via email (Resend) + SMS → client completes forms in sequence in browser → Stripe card capture on final step → all docs stored in Supabase Storage → therapist notified
- Client completes intake with no account required (token-based URL)
- Therapist sees intake status per client: Pending / Completed
- Therapist can resend intake link if expired

---

### Feature 4: Superbill Generator
**Signal:** 15–20 min per client per month of manual admin. Tax chaos signal across multiple posts.
**SP execution failure:** Superbills exist but not prominently surfaced; still requires manual steps.
**Our answer:** One click from the calendar after marking session complete. Auto-populated, emailed instantly.

- Trigger: therapist marks session "Completed" from calendar
- Modal: confirm CPT code (default 90837), ICD-10 diagnosis (pulled from client record), fee charged
- PDF generated via react-pdf, auto-populated: therapist NPI, license, practice name/address, session date, client name/DOB, CPT, ICD-10, fee, amount paid
- Stored at `superbills/[therapist_id]/[client_id]/[session_id].pdf` in Supabase Storage (signed URL access only)
- "Email to client" button → Resend delivers PDF
- Client downloads from portal; therapist downloads from session view

---

### Feature 5: Client Portal
**Signal:** Reduces "when's my appointment?" inbound message overhead. Magic link preferred per ADR-005.
**SP execution failure:** Portal exists but clients find it confusing and rarely use it.
**Our answer:** Magic link (no password), clean mobile layout, only what a client actually needs.

- Access via magic link (Supabase Auth) — no password required
- On first login: confirm contact info, set notification preferences
- Sections:
  - **Appointments:** Upcoming sessions (date, time), cancel button (warns of fee if within window), past sessions list
  - **Documents:** Superbills (download PDF), signed intake docs (download PDF)
  - **Secure Messages:** Client sends message → therapist notified. Therapist replies from dashboard. NOT for clinical/crisis communications — disclaimer shown prominently
  - **Billing:** Card on file (last 4 digits), update card (new Stripe Setup Intent), payment history

---

### Feature 6: Caseload Intelligence (post-launch add-on)
**Signal:** Founder insight + context folder strategy. Not directly validated by Reddit but strong differentiation vs. SP (which has zero business intelligence).
**Builds on:** All session data already captured in Features 1–5.

- Active client count vs. therapist capacity maximum
- At-risk client flags — a client is flagged if ANY of:
  - 2+ cancellations/no-shows in last 30 days
  - Cadence drifted (weekly → biweekly) without therapist marking intentional
  - Last session >3 weeks ago, no future session scheduled
  - No future session scheduled at all
- Plain-language explanation of why a client is flagged (Claude Sonnet)
- Therapist marks flag as "intentional" or "resolved"
- Financial health view: effective hourly rate, monthly revenue trend, no-show cost, revenue model
- Weekly digest: Claude Sonnet generates "Your practice this week" summary, Resend delivers Friday
- SimplePractice CSV import for therapists migrating their existing session history

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API routes (Route Handlers) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + magic link) |
| File storage | Supabase Storage (signed URLs for documents) |
| SMS | Twilio |
| Payments | Stripe (card capture at booking/intake, session payments, late cancel fees, therapist subscription) |
| PDF generation | react-pdf |
| Email | Resend (transactional emails + weekly digest) |
| AI | Anthropic SDK — Sonnet for full analysis, weekly digest, financial narratives, at-risk explanations; Haiku for classification and short summaries |
| Data import | SimplePractice CSV export (primary) + manual entry (fallback) |
| Deployment | Vercel |
| Validation | Zod (all API routes) |

---

## HIPAA COMPLIANCE — NON-NEGOTIABLE

This app handles Protected Health Information (PHI). Every decision must account for this.

### Rules that must be followed:
- **All PHI stored in Supabase only** — never in logs, never in error messages, never in client-side state beyond what's needed for display
- **Never pass raw PHI to Claude API** — pseudonymize before sending (use client_id, not client name or diagnosis)
- **Never use AI for clinical decision-making** — AI generates business intelligence summaries only
- **Signed BAA required** with Supabase, Twilio, Stripe, Resend before launch
- **Encryption at rest** — Supabase handles this by default, do not disable
- **Encryption in transit** — HTTPS always, never HTTP
- **Audit logging** — log who accessed what record and when (use `audit_logs` table)
- **No PHI in URLs** — use internal IDs only, never client names or session details in URL paths
- **No PHI in SMS** — "You have an appointment tomorrow at 2pm" NOT the therapist name + diagnosis
- **Session tokens** — short-lived (1 hour), refresh via Supabase session management
- **Row Level Security (RLS)** — every Supabase table must have RLS enabled. Therapists see only their own data. Clients see only their own records.
- **No third-party analytics receiving PHI** — no FullStory, no Hotjar on authenticated pages

---

## DATABASE SCHEMA (source of truth)

```sql
-- Therapists (one per account)
therapists (
  id uuid primary key,
  user_id uuid references auth.users,
  full_name text,
  license_type text,           -- LCSW, LPC, PhD, etc.
  license_number text,
  npi text,
  practice_name text,
  practice_address jsonb,
  phone text,
  email text,
  stripe_customer_id text,
  stripe_account_id text,      -- for receiving payments
  cancellation_hours int default 24,
  late_cancel_fee int,         -- in cents
  session_fee int,             -- default fee in cents
  capacity_max int default 25, -- therapist's self-set max caseload
  timezone text,
  created_at timestamptz default now()
)

-- Availability (therapist weekly schedule)
availability (
  id uuid primary key,
  therapist_id uuid references therapists,
  day_of_week int,             -- 0=Sunday, 6=Saturday
  start_time time,
  end_time time,
  is_active bool default true
)

-- Clients
clients (
  id uuid primary key,
  therapist_id uuid references therapists,
  user_id uuid references auth.users nullable,  -- null until portal login
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  stripe_customer_id text,
  stripe_payment_method_id text,
  diagnosis_code text,          -- ICD-10
  session_frequency_target int, -- sessions per month therapist expects
  source text,                  -- referral source (Psychology Today, word of mouth, etc.)
  is_active bool default true,
  created_at timestamptz default now()
)

-- Sessions (appointments)
sessions (
  id uuid primary key,
  therapist_id uuid references therapists,
  client_id uuid references clients,
  scheduled_at timestamptz,
  duration_minutes int default 50,
  status text,                 -- scheduled | completed | cancelled | no_show | late_cancel
  cpt_code text default '90837',
  fee_charged int,             -- in cents
  fee_collected int,           -- in cents (may differ from charged if waived)
  payment_status text,         -- pending | paid | waived
  stripe_payment_intent_id text,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz default now()
)

-- Notes
notes (
  id uuid primary key,
  therapist_id uuid references therapists,
  client_id uuid references clients,
  session_id uuid references sessions,
  template_type text,          -- SOAP | DAP | BIRP | progress
  content jsonb,               -- structured fields per template
  is_signed bool default false,
  signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- Intake documents
intake_documents (
  id uuid primary key,
  therapist_id uuid references therapists,
  client_id uuid references clients,
  document_type text,          -- consent_to_treat | telehealth_consent | cancellation_policy | intake_form | card_authorization
  content jsonb,
  signed_at timestamptz,
  storage_path text,
  created_at timestamptz default now()
)

-- Superbills
superbills (
  id uuid primary key,
  therapist_id uuid references therapists,
  client_id uuid references clients,
  session_id uuid references sessions,
  generated_at timestamptz default now(),
  storage_path text,
  emailed_to_client bool default false,
  emailed_at timestamptz
)

-- SMS reminders log
reminders (
  id uuid primary key,
  session_id uuid references sessions,
  client_id uuid references clients,
  reminder_type text,          -- 48hr | 24hr | 2hr | confirmation
  sent_at timestamptz,
  twilio_message_sid text,
  status text                  -- sent | delivered | failed
)

-- Caseload snapshots (computed daily)
caseload_snapshots (
  id uuid primary key,
  therapist_id uuid references therapists,
  snapshot_date date,
  active_count int,
  capacity_max int,
  utilization_pct numeric,
  at_risk_count int,
  effective_hourly_rate int,   -- in cents
  created_at timestamptz default now()
)

-- Risk flags per client
risk_flags (
  id uuid primary key,
  therapist_id uuid references therapists,
  client_id uuid references clients,
  flag_type text,              -- cancellation_pattern | cadence_drift | long_gap | no_future_session
  flagged_at timestamptz default now(),
  resolved_at timestamptz,     -- null = still active
  resolution text              -- intentional | re-engaged | discharged
)

-- Data imports
data_imports (
  id uuid primary key,
  therapist_id uuid references therapists,
  import_type text,            -- simplepractice_csv | manual
  imported_at timestamptz default now(),
  row_count int,
  status text                  -- processing | complete | failed
)

-- Audit log (HIPAA)
audit_logs (
  id uuid primary key,
  actor_id uuid,               -- therapist or client user_id
  actor_type text,             -- therapist | client
  action text,                 -- viewed_note | generated_superbill | etc.
  resource_type text,
  resource_id uuid,
  ip_address text,
  created_at timestamptz default now()
)
```

---

## AI USAGE PATTERN

Use Claude for business intelligence — never for clinical decisions.

**Claude Sonnet** (full analysis):
- Weekly digest narrative: "Your practice this week" summary
- At-risk client explanations: plain-language reason why a client is flagged
- Financial coaching: "Here's what a rate change would do to your income"
- Caseload health summaries

**Claude Haiku** (fast classification):
- Categorize cancellation patterns
- Short status labels and tooltips
- Any classification that doesn't need narrative

**PHI handling with AI:**
- Always pseudonymize before sending to Claude API — use `client_id`, not name or diagnosis
- Never send session notes content to Claude API
- System prompt includes therapist context (capacity, fee range, timezone) — cache this with Anthropic prompt caching to reduce latency and cost
- Token budget: Haiku for anything under 200 tokens output, Sonnet for anything requiring reasoning

---

## API ROUTE CONVENTIONS

Every API route must follow this exact pattern — no exceptions:

```typescript
// 1. Auth check
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Zod validation of request body
const parsed = schema.safeParse(await request.json())
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

// 3. Ownership check — verify the resource belongs to this user
// e.g., verify client.therapist_id === therapist.id before returning data

// 4. DB operation

// 5. Audit log write (for PHI access)

// 6. Return response
```

Never use `as any`. Never skip the ownership check. Never expose PHI in error messages.

---

## FOLDER STRUCTURE

```
Solo_practice/
├── CLAUDE.md                          # This file — read first always
├── context/                           # Product strategy docs (read-only reference)
├── docs/
│   ├── idea_proposal.md
│   ├── research/
│   ├── decisions/
│   └── specs/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login, signup pages
│   │   ├── (therapist)/               # Therapist dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── caseload/              # Caseload intelligence dashboard
│   │   │   ├── clients/
│   │   │   ├── import/                # CSV import flow
│   │   │   ├── finances/              # Financial health view
│   │   │   ├── schedule/
│   │   │   ├── notes/
│   │   │   └── settings/
│   │   ├── (client-portal)/           # Client-facing portal
│   │   ├── book/[therapistSlug]/      # Public booking page (no auth)
│   │   └── api/
│   │       ├── caseload/              # Snapshot + risk flag endpoints
│   │       ├── import/                # CSV import endpoint
│   │       ├── sessions/
│   │       ├── clients/
│   │       ├── notes/
│   │       ├── superbills/
│   │       ├── intake/
│   │       ├── reminders/
│   │       ├── digest/                # Weekly digest generation
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                        # Primitive UI components
│   │   ├── caseload/                  # Capacity gauge, risk flag cards, client list
│   │   ├── scheduling/                # Calendar, booking form
│   │   ├── notes/                     # Note editor, template picker
│   │   ├── intake/                    # Intake form builder + completion
│   │   ├── superbill/                 # Superbill preview + generator
│   │   └── client-portal/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   └── server.ts              # Server client
│   │   ├── ai/
│   │   │   ├── client.ts              # Anthropic SDK client (prompt caching configured)
│   │   │   ├── digest.ts              # Weekly digest generation (Sonnet)
│   │   │   ├── risk-summary.ts        # At-risk client plain-language explanation (Sonnet)
│   │   │   └── classify.ts            # Short classifications (Haiku)
│   │   ├── integrations/
│   │   │   └── simplepractice/
│   │   │       ├── csv-parser.ts      # Parse SimplePractice CSV export
│   │   │       └── field-map.ts       # Map SP fields → our schema
│   │   ├── caseload/
│   │   │   ├── snapshots.ts           # Daily snapshot computation
│   │   │   └── risk-flags.ts          # Risk detection heuristics
│   │   ├── types/
│   │   │   └── database.types.ts
│   │   ├── validation/
│   │   │   └── api-schemas.ts         # All Zod schemas
│   │   ├── utils/
│   │   │   ├── superbill.ts
│   │   │   ├── reminders.ts
│   │   │   └── error-reporter.ts
│   │   └── env.ts
│   └── hooks/
├── supabase/
│   └── migrations/
├── public/
└── tests/
```

---

## BUILD SEQUENCE

Build in this exact order. Each phase complete before the next begins. Timelines assume Claude Code as primary builder.

### Phase 0 — Foundation (days 1–3)
- [ ] Supabase project setup + all tables created with RLS policies
- [ ] Next.js scaffold: TypeScript, Tailwind, path aliases, ESLint
- [ ] Auth flow: signup, login, logout, session management (Supabase Auth)
- [ ] Therapist onboarding: profile (name, license, NPI, practice name/address), timezone, session fee, cancellation window, late cancel fee, capacity max
- [ ] Env validation (`lib/env.ts`) — all required vars validated at startup
- [ ] Basic dashboard shell: authenticated layout, nav, therapist profile page

### Phase 1 — Notes (days 4–8)
*Highest Reddit signal. Daily use. SP's auto-save failure is an active switch trigger.*
- [ ] Note editor component: structured fields per template type, auto-save on every keystroke
- [ ] Template definitions: SOAP, DAP, BIRP, Progress Note (field schemas in `lib/validation/api-schemas.ts`)
- [ ] Notes API route (`/api/notes`) — create, update, sign
- [ ] Sign + lock: once signed, `is_signed = true`, `signed_at` set, content immutable
- [ ] Addendum support: separate timestamped entry appended to signed note
- [ ] Notes list per client
- [ ] Audit log on every note view and sign event

### Phase 2 — Scheduling + SMS (days 9–15)
*Four separate Reddit signals, $27,300/year no-show cost, auto-cancellation enforcement.*
- [ ] Availability setup: therapist sets weekly schedule (days + time blocks)
- [ ] Slot calculation: generate available 50-min slots from availability, respecting buffers + existing bookings
- [ ] Public booking page (`/book/[therapistSlug]`): therapist name, available slots for next 4 weeks, client details form, Stripe Setup Intent (card capture)
- [ ] Session creation on booking with status `scheduled`
- [ ] Twilio SMS: confirmation on booking, 48hr, 24hr, 2hr reminders (Supabase pg_cron or Vercel cron)
- [ ] Cancel/reschedule flow: CANCEL reply or link → check window → free cancel or auto-charge late fee
- [ ] Therapist calendar: week view, session details on click, mark complete, mark no-show
- [ ] Manual waive late cancel fee from dashboard

### Phase 3 — Intake (days 16–20)
*#1 barrier to going solo. 2–3 hours per new client eliminated.*
- [ ] Intake document templates: 5 default documents, therapist can customize text
- [ ] Intake link generation: unique token per client, 72hr expiry, stored in DB
- [ ] Client intake flow: token-validated, no auth required, sequential form completion
- [ ] Stripe card capture on final intake step (Setup Intent)
- [ ] Store signed documents in Supabase Storage, update intake status
- [ ] Therapist view: intake status (Pending / Completed) per client, resend link option
- [ ] Email + SMS notification to therapist on completion

### Phase 4 — Superbills (days 21–24)
*15–20 min per client per month reclaimed. One click from calendar.*
- [ ] Session completion modal: confirm CPT, ICD-10, fee charged
- [ ] react-pdf superbill template: all required fields auto-populated
- [ ] PDF stored in Supabase Storage at `superbills/[therapist_id]/[client_id]/[session_id].pdf`
- [ ] "Email to client" → Resend with PDF attachment
- [ ] Superbill history per client; therapist download from session view

### Phase 5 — Client Portal (days 25–30)
*Reduces inbound overhead. Foundation for caseload intelligence data visibility.*
- [ ] Magic link auth flow (Supabase Auth email OTP)
- [ ] Portal: upcoming sessions, cancel button with fee warning, past sessions
- [ ] Documents section: superbills + signed intake docs (signed URL download)
- [ ] Secure messaging: client sends → therapist notified, therapist replies from dashboard
- [ ] Billing section: card on file, update card, payment history
- [ ] Stripe billing for therapist subscription ($79/month, Stripe Billing)

### Phase 6 — Caseload Intelligence (days 31–38)
*Post-launch add-on. All data already captured — this surfaces it.*
- [ ] SimplePractice CSV parser (`lib/integrations/simplepractice/`)
- [ ] Import flow UI + API route
- [ ] Risk flag detection (4 heuristics) + daily Supabase pg_cron computation
- [ ] Caseload dashboard: capacity gauge, at-risk client list, client cards
- [ ] Client detail view: session history, cadence view, active flags, flag resolution
- [ ] Financial health view: effective hourly rate, no-show cost, revenue trend
- [ ] Weekly digest: Claude Sonnet narrative, Resend delivery every Friday

### Phase 7 — Polish + Launch (days 39–45)
- [ ] Error handling + ErrorBoundary throughout
- [ ] First-time therapist onboarding walkthrough (guided setup)
- [ ] RLS audit: every table policy verified
- [ ] PHI-in-logs audit: grep for name/email/diagnosis in all logging paths
- [ ] Performance pass: Core Web Vitals, Supabase query optimization
- [ ] Security audit
- [ ] Beta invite flow

---

## WHAT CLAUDE SHOULD NEVER DO

- Add features not in the current build phase without being asked
- Use `as any` in TypeScript
- Skip Zod validation on any API route
- Skip the ownership check on any API route
- Store PHI in browser localStorage or cookies
- Log PHI to console or error tracking
- Pass client names, diagnoses, or session content to Claude API — pseudonymize first
- Use AI for anything clinical — business intelligence only
- Write migrations that drop or alter existing columns without explicit instruction
- Create a new file when editing an existing one would suffice
- Add comments explaining what code does — only comment WHY when non-obvious
- Implement features "just in case" they're needed later
- Use business language in UI copy — always therapist language

---

## ENV VARIABLES REQUIRED

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Practice OS

# SimplePractice (optional — future direct API integration)
SIMPLEPRACTICE_API_KEY=
```

---

## KEY DECISIONS ALREADY MADE

1. **Notes first** — highest Reddit signal (1,995 upvotes), daily use, and SP's auto-save failure is an active switch trigger. This is the feature that gets therapists in the door.
2. **Build order is evidence-driven** — Reddit upvotes + SimplePractice execution failures determine priority. Do not reorder phases without a signal-based reason.
3. **Auto-save on every keystroke for notes** — not every 30 seconds, not on blur. Every keystroke. This is the #1 differentiator vs. SimplePractice on day one.
4. **Cancellation fees enforce themselves** — auto-charge via Stripe when within late cancel window. Therapist never has the awkward conversation. This is a key emotional selling point.
5. **No transaction fees** — we charge $79/month flat. We do not take a percentage of session fees. SP takes 3.15% + $0.30. On a $200/session therapist with 20 clients/week, that's $660/month in fees vs. our $79. Make this comparison visible.
6. **No AI for clinical decisions** — Claude API is for business intelligence summaries only. Never surfaces diagnostic, treatment, or clinical risk information.
7. **PHI pseudonymization before AI calls** — client_id goes to Claude, never name or diagnosis
8. **Prompt caching** — Anthropic SDK prompt caching on all AI calls with static system context (therapist profile)
9. **CSV import first** — SimplePractice API integration is a future phase; CSV export is available to all SP users today
10. **Magic link for client portal** — clients don't want another password
11. **Superbills only, not EOBs** — we help clients submit to insurance; we don't bill insurance directly
12. **$79/month flat** — no per-client fees, no feature tiers, no transaction fees
13. **No insurance billing** — too complex, solo therapists in private pay avoid it by design
14. **No AI session recording** — 1,995-upvote warning post on r/therapists. Trust barrier is too high. Structured templates are our answer.
15. **Therapist language everywhere** — "Churn," "pipeline," "utilization," "conversion" are banned from the UI

---

---

## PRIORITY RATIONALE (why features are ordered this way)

| Feature | Reddit signal | SP failure | Build order |
|---|---|---|---|
| Notes | 1,995 upvotes — AI notes distrust post; notes = #1 burnout source | No auto-save, slow load, inflexible | **1st** |
| Scheduling + SMS | 1,429 (can't enforce policies) + 658 (SMS cuts no-shows 50%) + 647 (income unpredictability) | Cancellation enforcement clunky, high no-show rate | **2nd** |
| Intake | Setup complexity = #1 barrier to going solo; 2–3 hrs per new client | Exists but confusing, clients don't complete | **3rd** |
| Superbills | 15–20 min per client per month; tax chaos posts | Exists but buried, manual steps | **4th** |
| Client Portal | Reduces inbound overhead; unlocks caseload data | Exists but unused by clients | **5th** |
| Caseload Intelligence | Founder insight; zero Reddit validation but strong SP gap | SP has zero business intelligence | **6th** |

---

*Last updated: April 25, 2026*
*Product: Practice OS v1*
*Priority basis: Reddit r/therapists upvote signals + SimplePractice competitive gaps*
