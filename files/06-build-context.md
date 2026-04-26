# Practice OS — Build Context for Claude Code

## What We're Building
A solo practice management SaaS for independent mental health therapists. The entry wedge is **Caseload Intelligence** — surfacing dropout risk, capacity visibility, and financial health insights that therapists currently have no visibility into.

This is **not** another AI notes tool or EHR. It sits on top of existing clinical tools (SimplePractice, TherapyNotes) as the business intelligence layer.

## Stack Decisions (to be finalized, current thinking)
- **Frontend**: Next.js + Tailwind
- **Backend**: Supabase (auth + postgres + realtime)
- **AI**: Claude API (Sonnet for reasoning/insights, Haiku for lightweight classification)
- **Primary data source**: SimplePractice API (most common EHR for solo therapists) + CSV import fallback
- **Auth**: Supabase Auth (email/password + magic link)

## Core Data Model (v1)
```
Therapist (user)
  - id, email, name, license_type, practice_name
  - subscription_tier, onboarded_at

Client
  - id, therapist_id, name (or pseudonym), status (active/inactive/prospect)
  - start_date, session_frequency_target (weekly/biweekly/monthly)
  - fee_per_session, insurance_or_private_pay
  - source (how they found therapist: psychology_today, referral, etc.)

Session
  - id, client_id, therapist_id
  - scheduled_at, occurred_at, duration_minutes
  - status (completed/cancelled_with_notice/no_show/rescheduled)
  - fee_charged, fee_collected

CaseloadSnapshot (computed, daily)
  - therapist_id, date
  - active_count, capacity_max (set by therapist), utilization_pct
  - at_risk_count, effective_hourly_rate
```

## v1 Feature Scope (Build This First)
1. **Onboarding**: Connect SimplePractice or CSV import of session history
2. **Caseload dashboard**: Active clients, capacity gauge, at-risk flags
3. **Client detail view**: Session history, cadence health, risk signals
4. **Weekly digest**: Email or in-app summary — "Here's your practice this week"
5. **Basic financial view**: Monthly revenue, effective hourly rate, no-show cost

## Risk Signal Logic (v1 heuristics — refine with real data)
A client is flagged "at risk" if ANY of the following:
- 2+ cancellations or no-shows in the last 30 days
- Session cadence has drifted (e.g., weekly → biweekly over last 6 weeks) without therapist marking it intentional
- Last session was >3 weeks ago with no future session scheduled
- Response time to therapist messages increasing (if messaging data available)

## Design Principles
- **Therapist language, not business language**: "Who might be pulling back?" not "churn risk"
- **Proactive, not reactive**: Surface insights before the therapist has to ask
- **Non-judgmental tone**: Never make the therapist feel like they failed. Frame as "here's what's happening" not "here's what you did wrong"
- **Minimal UI**: Therapists are time-scarce. Every screen should answer one question clearly.
- **HIPAA considerations**: Client names should be pseudonymizable. No PHI stored in logs. Encrypt at rest.

## What We're NOT Building in v1
- Insurance billing (handled by EHR)
- AI session notes (commodity, refer to Mentalyc/Upheal)
- Telehealth video
- Client portal or messaging
- Marketing / SEO tools
- Multi-clinician / group practice features

## Key UX Flows to Design First
1. **First login / onboarding**: Connect data source → see first caseload snapshot (aha moment)
2. **Daily dashboard**: Open app → see capacity gauge + any new at-risk flags + this week's schedule
3. **At-risk client flow**: Click flag → see why flagged → one-tap to note it's intentional or to act
4. **Weekly digest**: Friday email → "Your practice this week" summary with one insight

## AI Usage Pattern
Use Claude API for:
- Generating natural-language summaries of caseload health ("Your practice looks stable this week, but [Client X] has cancelled twice in a row — worth a check-in")
- Explaining why a client is flagged in plain language
- Financial coaching prompts ("You haven't raised your rate in 14 months. Here's what a $15 increase would mean.")
- NOT for clinical decision-making — always defer to therapist judgment

TokenRouter pattern:
- Haiku: simple classification (is this session a no-show or a late cancel?), short summaries
- Sonnet: full caseload analysis, financial coaching narratives, weekly digest generation

## Compliance Notes
- HIPAA Business Associate Agreement (BAA) required before storing any client data
- Supabase offers BAA on paid plans — required before launch
- Client names should be stored encrypted; use display names / pseudonyms in UI where possible
- Audit logging required for any access to client records
- Data retention policy needed: how long do we keep session data after a therapist churns?
