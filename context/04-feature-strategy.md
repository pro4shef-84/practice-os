# Practice OS — Feature Strategy

## North Star
Give a solo therapist the same visibility into their practice that a good business partner would give them — without requiring them to think like a business person.

## Entry Wedge: Caseload Intelligence
This is the first thing to build and the hook to acquire users. Solve this one thing exceptionally well before expanding.

### What Caseload Intelligence Means
- **Dropout risk signals**: Surface clients showing early warning signs (increasing cancellation frequency, longer response times, shorter sessions, pattern breaks) before they ghost
- **Real capacity visibility**: "You have 22 active clients. Your sustainable max is 24. You have room for 2 more." — not just a calendar count
- **Session cadence health**: Which clients are drifting from weekly to biweekly to monthly without an explicit decision?
- **Caseload composition**: Mix of presenting issues, session lengths, fee levels — is your caseload set up for sustainability?

### Why This Is the Wedge (Not Notes)
- Notes tools are commodity. Caseload intel is defensible.
- The pain is emotionally resonant — therapists feel client loss personally
- It's a daily-use feature tied to their core professional identity
- It surfaces value immediately without requiring them to change behavior

---

## Phase 2: Retention Layer
Once caseload intel is sticky, expand to proactive retention actions.

- **Re-engagement nudges**: "You haven't heard from [Client] in 3 weeks — want to send a check-in?" (therapist-controlled, never automated)
- **Session gap alerts**: Flag when a client's next session is more than X weeks out without explicit decision
- **Intake-to-retention funnel**: Track prospects from first contact through first session through ongoing care
- **Referral source tracking**: Where are your clients coming from? Which sources produce the clients who stay longest?

---

## Phase 3: Financial Coaching
The business health layer — surfaces insights the therapist would never calculate themselves.

- **Effective hourly rate**: Accounting for no-shows, late cancels, sliding scale clients
- **Revenue trends**: Month-over-month, seasonal patterns
- **"Raise your rate" prompt**: "Your effective rate hasn't changed in 18 months. Inflation is up 12%. Here's what a $20 rate increase would mean for your annual income."
- **Caseload revenue modeling**: "If you filled your 2 open slots with full-fee clients, you'd earn an additional $X/month"
- **No-show cost visibility**: "You lost $X this month to late cancellations. Your current policy recouped $Y."

---

## What We Deliberately Don't Build (v1)
- **Insurance billing**: Handled by EHR. Not our lane. Adding it increases complexity with no competitive advantage.
- **AI notes**: Table stakes commodity. Can integrate with existing tools (Mentalyc, Upheal) via import or recommend alongside.
- **Telehealth video**: Commoditized. Therapists already use Zoom or SimplePractice.
- **Client portal / messaging**: Handled by EHR. Don't reinvent.
- **Marketing / SEO tools**: Out of scope for v1. The retention problem comes first.

---

## Integration Strategy
Don't compete with SimplePractice — sit on top of it.

- **Primary integration target**: SimplePractice API (most common EHR for solo therapists)
- **Data needed**: Session history, cancellation records, client contact cadence, billing data
- **Fallback**: CSV import for therapists on closed EHRs (TherapyNotes has no API)
- **Long-term**: Direct EHR integrations, potentially becoming the intelligence layer for any EHR

---

## Feature Prioritization Framework
For every feature decision, ask:
1. Does this help the therapist know something they couldn't know before? (intelligence)
2. Does this save time they're currently spending on something non-clinical? (efficiency)
3. Does this use business language or therapist language? (must be therapist language)
4. Would a solo therapist with 20 clients use this weekly? (frequency test)

If a feature fails #4, it's a nice-to-have, not a wedge feature.
