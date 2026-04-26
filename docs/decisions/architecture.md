# Architecture Decision Records
### Key decisions made before build started, and why

---

## ADR-001 — No insurance billing in V1

**Decision:** Do not build direct insurance billing (ERA processing, claim submission, EOB parsing).

**Why:**
- Solo therapists go private practice specifically to AVOID dealing with insurance directly
- Insurance paneling takes 3-6 months — this is a barrier to going solo, not our problem to solve
- ERA/EDI 835 processing requires clearinghouse integration (another vendor, another BAA, more complexity)
- Superbills (client self-submits to insurance) solve the 80% use case with 10% of the build effort

**Revisit:** V2 if demand signals are strong.

---

## ADR-002 — No AI session recording/transcription

**Decision:** Note templates with structured therapist-controlled fields only. No audio recording, no AI-generated notes from recordings.

**Why:**
- r/therapists had a 1,995-upvote post warning against AI session recording tools
- HIPAA + ethics board concerns are legitimate and widely held in the community
- Trust barrier would sink adoption before we can prove value
- Structured templates cut note time from 45 min to 15 min — that's enough ROI without AI risk

**Revisit:** If attitudes shift and HIPAA-safe recording becomes mainstream (3-5 years).

---

## ADR-003 — Stripe for therapist subscription + client payments

**Decision:** Stripe handles both therapist monthly subscription and client session payments.

**Why:**
- Signed BAA available from Stripe for HIPAA-covered entities
- Stripe Connect allows therapists to receive payments directly (funds go to their bank, not ours)
- Setup Intents allow card capture at intake without charging immediately
- Late cancel fee auto-charge is straightforward with a saved payment method

**Risk:** Stripe account freezing (known issue). Mitigation: clear business description, low chargeback risk (therapy is a professional service), regular payout schedule.

---

## ADR-004 — SMS via Twilio

**Decision:** All appointment reminders via SMS, not email.

**Why:**
- r/smallbusiness dental clinic proof point: switching from phone calls to SMS cut no-shows by ~50%
- People read texts; they don't pick up unknown numbers
- Email reminders get buried — therapist clients often aren't checking email daily
- Twilio has signed HIPAA BAA available

**SMS content rules:** Never include diagnosis, session type, or any clinical information in SMS. Only: appointment time, therapist first name, cancel/reschedule link.

---

## ADR-005 — Magic link preferred for client portal login

**Decision:** Client portal uses Supabase magic link auth (email-based, no password).

**Why:**
- Clients don't want another password to remember
- They visit the portal infrequently (to download superbills, check appointments)
- Magic links have lower friction than password reset flows when returning after 3 months
- Reduces support burden (no "I forgot my password" emails to therapist)

---

## ADR-006 — $99/month flat, no tiers

**Decision:** Single price, all features included.

**Why:**
- Solo therapist has no employees — per-seat pricing doesn't apply
- Feature gating forces therapists to evaluate "do I need superbills at this tier?" — adds friction
- $99 is well below SimplePractice ($69-99) for a simpler product — easier sell
- Therapist recovers the cost in 40 minutes of saved admin time per month
- Simplicity is a product differentiator — pricing complexity contradicts the brand

---

## ADR-007 — RLS on every Supabase table

**Decision:** Row Level Security enabled on every table from migration 001. No exceptions.

**Why:**
- HIPAA: therapists must only see their own clients' data
- Clients must only see their own records
- Defense in depth: even if API auth is bypassed, RLS prevents cross-account data leak
- Industry standard for HIPAA-covered SaaS on Supabase

**Pattern:**
```sql
-- Therapist can only see their own data
create policy "therapists_own_data" on clients
  for all using (therapist_id = (select id from therapists where user_id = auth.uid()));

-- Clients can only see their own record
create policy "clients_own_record" on clients
  for select using (user_id = auth.uid());
```

---

## ADR-008 — No multi-clinician features

**Decision:** One Supabase account = one therapist. If two therapists want to share a practice, they each get their own account.

**Why:**
- Group practice features (shared calendars, revenue splitting, supervisor access) are complex
- Our target user is explicitly solo — adding group features muddies positioning
- Two solo therapists in the same building are two separate customers, not one group account
- Keeps data isolation simple — no "practice" entity needed in the schema

---

## ADR-009 — Trades vertical as V2

**Decision:** V2 expansion targets solo tradespeople (plumbers, HVAC, electricians) with the same core architecture.

**Why:**
- Same job-to-be-done: schedule → remind → invoice → collect payment
- No HIPAA layer needed — removes the most complex part of the therapist build
- Direct signal: solo plumber explicitly said Jobber is too bloated, needs quotes/invoices/payments only
- Reuse: scheduling engine, Stripe integration, Twilio SMS — all carry over

**What changes for trades V2:**
- Replace "Notes" with "Quote Builder"
- Replace "Superbills" with "Invoice + Receipt"
- Replace "Intake forms" with "Job estimate forms"
- Remove HIPAA compliance layer
- Add mileage tracking (top tax deduction missed by solo tradespeople)
- Add photo-based job documentation (before/after photos on job record)
