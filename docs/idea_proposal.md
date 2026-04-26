# SoloPractice — Initial Idea Proposal
### A practice management tool built exclusively for one-person therapy practices
**Date:** April 15, 2026 | **Status:** Pre-validation

---

## 1. THE OPPORTUNITY IN ONE SENTENCE

Solo therapists in private practice are drowning in admin — notes, scheduling, no-shows, insurance billing — while paying enterprise-grade tools that were never designed for a one-person operation.

---

## 2. THE PROBLEM

### Who is the customer?
Licensed therapists (LCSWs, LPCs, psychologists) who have left group practices or agency work to run their own solo private practice. There are approximately **200,000 solo practice therapists in the US**, a number growing rapidly as therapists burn out of agency work and discover private practice income is 2-3x higher.

They typically:
- See 15-25 clients per week at $150-$300/session
- Gross $100,000-$250,000/year as a solo operator
- Work from a private office or via telehealth
- Have no staff — they are the clinician, the scheduler, the biller, and the marketer

### What is the core pain?
Every hour not spent with a client is unbillable time. Yet solo therapists lose **8-12 hours per week** to:

**1. Progress Notes (the biggest time sink)**
One hour of therapy generates one hour of clinical documentation. Notes must be completed within 24 hours. Therapists describe this as the #1 source of burnout — not the clinical work, the paperwork after it. AI recording tools exist but therapists don't trust them with confidential sessions (HIPAA concerns, ethics). The gap is structured note templates that cut completion time from 45 minutes to 15.

**2. No-Shows (direct revenue loss)**
A 20-30% no-show rate is common for therapists not running automated reminders. At $175/session, three no-shows per week = $27,300/year in lost revenue. Phone call reminders go to voicemail. The dental clinic proof point: SMS reminders alone cut no-shows by 50%.

**3. Insurance Superbills (invisible admin tax)**
Most solo therapists don't take insurance directly (the paneling process takes 3-6 months). Instead they generate "superbills" — itemized receipts clients submit to their insurance for reimbursement. Creating these manually per client is 15-20 minutes of admin per session. Automating this is a clear, high-value win.

**4. Client Intake and Onboarding**
New clients require consent forms, intake questionnaires, credit card capture, and policy agreements before the first session. Most therapists email PDFs and chase signatures. The setup alone keeps many from going solo.

**5. Client Acquisition Fear**
The #1 reason therapists don't go solo: "I don't know how to get clients." This is a marketing and visibility problem. Psychology Today directory ($30/month) is the primary channel but therapists don't know how to optimize it. Peer referral networks are underdeveloped.

### Direct evidence from Reddit (r/therapists, 200K members)
> *"The fear that slows many down is lack of certainty about client numbers."* — 543 upvotes

> *"Marketing is my concern."* — Top comment on practice-opening thread

> *"The biggest hurdle is getting paneled for insurance — you're at the mercy of their paneling department for months."*

> *"I have the organizational skills of a carrot and should not be trusted with any business decisions."*

> *"8 months in and already making triple the income with fewer hours. If I hadn't had such a horrible experience at the group practice, I probably never would have been pushed to start my own."*

---

## 3. WHY EXISTING TOOLS FAIL

| Tool | Price | Why Solo Therapists Hate It |
|---|---|---|
| SimplePractice | $69-99/month | Built for group practices — features solo ops never use, complex UI, expensive |
| TherapyNotes | $49/month | Clunky interface, poor mobile experience, no marketing features |
| Jane App | $74/month | Canada-focused, insurance workflow is US-unfriendly |
| Spreadsheet + DocuSign | $0-30/month | Works until it doesn't — no automation, no reminders, no billing |
| AI Note Tools (TheraPro, etc.) | $30-50/month | Serious HIPAA/ethics concerns — 1,995-upvote warning post on r/therapists |

**The core failure:** Every existing tool is built for a practice with staff, multiple clinicians, or complex insurance billing. Solo therapists are paying for 40 features and using 4.

---

## 4. THE SOLUTION — SOLOPRACTICE

**SoloPractice** is a practice management tool with exactly five features — chosen because they are the five highest-ROI admin tasks for a one-person therapy practice. Nothing more.

### Feature 1: Smart Scheduling + SMS Reminders
- Client self-schedules through a branded booking link
- Automated SMS confirmation sent immediately on booking
- Reminder sequence: 48 hours out, 24 hours out, 2 hours out
- One-tap cancel/reschedule (reduces friction = reduces no-shows)
- Cancellation policy enforcement built in (late cancel fee auto-charged)
- **Expected impact:** 50% reduction in no-shows = $10,000-$15,000/year recovered

### Feature 2: Structured Note Templates
- Pre-built SOAP, DAP, and session note templates by therapy modality (CBT, DBT, psychodynamic)
- Therapist fills in structured fields — not free text, not AI recording
- Auto-saves to client record, timestamps to meet documentation requirements
- Signature and lock function once complete
- **Expected impact:** Note completion time from 45 min → 15 min = 5+ hours/week recovered

### Feature 3: Digital Intake + Consent Package
- One link sent to new clients before first session
- Includes: intake questionnaire, consent to treat, telehealth consent, cancellation policy, credit card capture
- All signed digitally, stored in HIPAA-compliant record
- **Expected impact:** Eliminates 2-3 hours of new client setup per intake

### Feature 4: Superbill Generator
- After each session, one-click generates a properly formatted superbill
- Auto-populates: therapist NPI, client info, CPT codes, diagnosis codes, session date, fee
- Emailed directly to client or stored in their portal
- **Expected impact:** 15 minutes saved per client per month = 5+ hours/month for a full caseload

### Feature 5: Client Portal
- Clients can view upcoming appointments, download superbills, complete intake forms, message therapist
- Reduces inbound "when is my next appointment?" emails and texts
- Branded to the therapist's practice name

### What we deliberately do NOT build (v1):
- Insurance billing / ERA processing (complex, adds 6 months to build)
- AI session recording / transcription (trust barrier too high)
- Group practice multi-clinician features (we are a 1-person tool)
- Outcome measurement tools
- Video/telehealth (Zoom integration is sufficient)

---

## 5. BUSINESS MODEL

**Pricing:** $99/month flat. No per-client fees, no tiers, no feature gating.

**Why $99:**
- 50% below SimplePractice's top plan
- A therapist recovers this cost in 40 minutes of recovered billable time per month
- No-show reduction alone justifies 6 months of subscription in the first saved session
- Simple enough that therapists don't need to calculate ROI — it's obvious

**Unit economics (target):**
- CAC target: $150-200 (referral-driven, low paid spend)
- LTV at $99/month with 24-month average retention: ~$2,400
- LTV:CAC ratio: ~12:1
- Breakeven per customer: ~2 months

**Revenue targets:**
- 100 customers = $9,900 MRR ($118,800 ARR) — proof of concept
- 500 customers = $49,500 MRR ($594,000 ARR) — growth stage
- 2,000 customers = $198,000 MRR ($2.4M ARR) — 1% of addressable market

---

## 6. GO-TO-MARKET

### Phase 1: Community-Led (months 1-3)
**Channel: r/therapists (200K members)**
- Participate authentically in practice ops discussions
- Share genuinely useful content: "How I cut my note time from 45 to 15 minutes" (no product pitch)
- Build credibility before ever mentioning the product
- Target: 20-30 beta users from organic community engagement

**Channel: Therapist Facebook Groups**
- "Private Practice Therapists" group has 80K+ members
- Same organic approach — answer questions, share frameworks
- Beta offer: 6 months free for feedback

### Phase 2: Referral Engine (months 3-6)
- Therapists talk to each other constantly — supervision groups, peer consultation, cohorts
- Build a formal referral program: 2 months free for referrer + referee
- One happy therapist in a 5-person supervision group = 4 warm leads

**Channel: Psychology Today Profile Optimization**
- Every solo therapist has a Psychology Today profile ($30/month)
- Create a free guide: "How to optimize your Psychology Today listing to fill your caseload in 90 days"
- Gate it with email signup → nurture sequence → product demo

### Phase 3: Content SEO (months 4-12)
Target keywords with clear commercial intent:
- "SimplePractice alternative for solo therapist" (low competition, high intent)
- "free SOAP note template for therapists" (high volume, top of funnel)
- "how to create a superbill for clients" (direct pain, mid funnel)
- "therapist private practice software" (broad, high intent)

### What we do NOT spend on (v1):
- Paid social ads (too expensive for therapist targeting)
- Conference sponsorships (too slow, too expensive)
- Cold email (therapists distrust marketing)

---

## 7. COMPETITIVE MOAT

**Short-term moat: Right-sizing**
We win by doing 5 things well for one specific user, not 50 things mediocrely for everyone. Solo therapists will choose us not because we're cheaper, but because we don't make them feel stupid.

**Medium-term moat: Data + templates**
As we accumulate note templates and intake form libraries across modalities and states, the template quality becomes a network effect. We'll have the best EMDR note template, the best DBT session note — because 500 therapists helped refine it.

**Long-term moat: Workflow lock-in**
Once a therapist's client records, notes, and scheduling history live in SoloPractice, switching cost is high. This is the same lock-in SimplePractice enjoys — we just get there at lower price with better UX.

---

## 8. RISKS AND MITIGATIONS

| Risk | Severity | Mitigation |
|---|---|---|
| HIPAA compliance burden | High | Use AWS + BAA, follow SimplePractice's playbook. 2-3 week engineering effort, not months. |
| SimplePractice cuts price | Medium | They won't — their cost structure is built for group practice. Solo pricing would cannibalize their upsell path. |
| "Why not just use SimplePractice Lite?" | Medium | Positioning: we are purpose-built for solo, not a downgraded group tool. |
| Low therapist tech comfort | Medium | Onboarding must be 30-min or less, white-glove via Loom videos. |
| Slow client acquisition | Low-Medium | Community-first approach has zero CAC — 20 beta users before spending a dollar. |
| Insurance billing demand | Low | Intentionally deferred to v2 — solo therapists avoid insurance by design (that's why they went solo). |

---

## 9. EXPANSION PATH

**V2 (month 9-12): Trades/Field Service vertical**
The same core architecture — schedule → remind → invoice → collect payment — applies directly to solo plumbers, HVAC techs, electricians. Strip the HIPAA layer, add quote builder, change the skin. Same product, different packaging.

Direct evidence: Solo plumber on Reddit: *"All I need is quotes, invoices, payments, and maybe something for incoming calls. The app runs slow on my phone which drives me nuts at a customer's house."* — This is an identical job-to-be-done.

**V3: Adjacent solo health practitioners**
Nutritionists, personal trainers, acupuncturists, massage therapists — all have the same scheduling + notes + intake + payment stack. HIPAA applies to some, not all. Once the therapist product is proven, these verticals require minimal additional build.

---

## 10. WHAT WE NEED TO VALIDATE NEXT

Before building anything, validate three assumptions:

**Assumption 1: Note templates alone would get someone to pay**
- Test: Offer a free "Note Template Pack" download (no product) to r/therapists
- Success metric: 200+ downloads in first week

**Assumption 2: $99/month is the right price**
- Test: Create a landing page with pricing — measure "Start Free Trial" click rate at $79, $99, $129
- Success metric: >30% click-through on the pricing CTA at $99

**Assumption 3: Community can drive first 20 customers without paid spend**
- Test: Spend 4 weeks participating genuinely in r/therapists and therapist FB groups, then do a soft product mention
- Success metric: 5+ people DM asking to try it

**Total cost of validation: $0 and 4 weeks.**

---

## 11. THE ASK

To move from idea to validated concept, we need:

| Item | Cost | Timeline |
|---|---|---|
| Landing page (no-code) | $0-200 | Week 1 |
| Note template pack (content) | $0 (research + write) | Week 1-2 |
| Community presence building | Time only | Weeks 1-4 |
| First 10 beta interviews | Time only | Weeks 2-4 |
| Basic prototype (Figma or Framer) | $0-500 | Weeks 3-6 |
| **Total pre-build validation budget** | **$200-700** | **6 weeks** |

No code written. No infrastructure built. No money spent on ads.
If after 6 weeks we have 10+ therapists who say "I would pay $99 for this today" — we build.
If we don't — we saved ourselves 6 months of engineering time.

---

## 12. ONE-LINE PITCH

**SoloPractice is the only practice management tool built for one-person therapy practices — five features that eliminate 10 hours of admin per week, at half the price of tools designed for group practices.**

---

*Research basis: 3 rounds of Reddit signal gathering across r/therapists, r/solopreneur, r/smallbusiness, r/freelance, r/selfemployed. 700+ posts and comments analyzed. All quotes are verbatim from real posts.*
