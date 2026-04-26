# Feature Specifications — V1
### Detailed behavior for each of the 5 features. This is the build contract.

---

## FEATURE 1: Scheduling + SMS Reminders

### Therapist setup
- Therapist sets weekly availability: days + time blocks (e.g., Mon/Wed/Fri 9am-5pm)
- Therapist sets: session duration (default 50 min), buffer between sessions (default 10 min)
- Therapist sets: cancellation window (default 24 hours), late cancel fee (in dollars)
- Therapist gets a unique booking URL: `solopractice.app/book/[slug]`

### Public booking page (no auth required)
- Shows therapist name, photo (optional), available slots for next 4 weeks
- Client enters: first name, last name, email, phone
- Client selects available slot
- Client enters credit card (Stripe Setup Intent — card saved, not charged yet)
- On submit: session created with status `scheduled`

### Confirmation + reminders (Twilio SMS)
- On booking: "Hi [first name], you're confirmed with [therapist first name] on [day] at [time]. Reply CANCEL to cancel."
- 48hr before: "Reminder: you have an appointment tomorrow at [time]. Reply CANCEL to cancel."
- 24hr before: "Reminder: your appointment is tomorrow at [time]. Need to cancel? Reply CANCEL (free until [cutoff time])."
- 2hr before: "Your appointment is in 2 hours. See you soon."

### Cancel/reschedule flow
- Client replies CANCEL to any SMS or clicks link → directed to simple cancel page
- If within free window: cancelled, slot freed, no charge
- If within late cancel window: late cancel fee charged automatically to card on file, therapist notified
- Therapist can manually waive late cancel fee from dashboard

### Therapist calendar view
- Week view showing all scheduled, completed, cancelled sessions
- Click session → see client name, time, status, payment status
- Button to mark session complete (triggers superbill generation flow)
- Button to mark no-show (triggers no-show charge logic if configured)

---

## FEATURE 2: Structured Note Templates

### Template types (v1)
1. **SOAP** — Subjective, Objective, Assessment, Plan
2. **DAP** — Data, Assessment, Plan
3. **BIRP** — Behavior, Intervention, Response, Plan
4. **Progress Note** — simplified narrative format

### Note creation flow
- Therapist opens session → clicks "Write Note"
- Selects template type (or defaults to their preferred template)
- Fills structured fields (each section is a labeled textarea, not one big box)
- Saves draft (auto-saves every 30 seconds)
- When complete: clicks "Sign Note" → timestamp locked, note becomes read-only

### SOAP template fields
- **Subjective:** Client's reported mood, presenting concerns, events since last session
- **Objective:** Therapist observations (affect, behavior, appearance, speech)
- **Assessment:** Clinical impression, progress toward treatment goals, risk assessment (SI/HI: yes/no/details)
- **Plan:** Interventions used this session, homework assigned, plan for next session

### DAP template fields
- **Data:** What the client reported and what was observed
- **Assessment:** Therapist's clinical interpretation
- **Plan:** Next steps, interventions, goals

### BIRP template fields
- **Behavior:** Client's presenting behavior and reported concerns
- **Intervention:** Therapeutic techniques and interventions used
- **Response:** Client's response to intervention
- **Plan:** Next session focus, homework

### Business rules
- Notes are scoped to a session — one note per session
- Notes cannot be edited after signing (HIPAA record integrity)
- Therapist can add an addendum to a signed note (separate timestamped entry)
- Notes visible only to therapist — never to client
- Viewing a note writes to audit_logs

---

## FEATURE 3: Digital Intake + Consent Package

### Therapist setup (one-time)
- Therapist configures their intake package in Settings
- Default documents included:
  1. Consent to Treatment
  2. Telehealth Consent (if applicable)
  3. Cancellation & Late Cancel Policy
  4. Client Intake Questionnaire (presenting concerns, history, medications, emergency contact)
  5. Credit Card Authorization Form
- Therapist can customize the text of each document

### New client intake flow
- Therapist adds new client (name + email + phone)
- System generates a unique, time-limited intake link (expires 72 hours)
- Intake link sent to client via email (Resend) and/or SMS
- Client opens link in browser — no account required
- Client completes each form in sequence
- On last form: Stripe card capture (Setup Intent)
- On submit: all documents stored in Supabase Storage, therapist notified

### Therapist view
- Client list shows intake status: Pending / Completed
- Clicking client shows all signed intake documents
- Can resend intake link if expired

---

## FEATURE 4: Superbill Generator

### Trigger
- Therapist marks session as "Completed" from calendar view
- Modal opens: confirm CPT code (default 90837), diagnosis code (ICD-10, pulled from client record), fee charged

### Superbill contents (auto-populated)
- Therapist full name, license type, license number, NPI
- Practice name and address
- Session date
- Client name, date of birth
- CPT code + description
- ICD-10 diagnosis code
- Fee charged
- Amount paid
- "Amount paid by patient" (for insurance reimbursement claim)

### PDF generation
- Generated via react-pdf
- Stored in Supabase Storage with path: `superbills/[therapist_id]/[client_id]/[session_id].pdf`
- Accessible only by therapist and client (signed URLs)

### Distribution
- Therapist clicks "Email to client" → sent via Resend with PDF attached
- Client can also download from their portal
- Therapist can download from session view

---

## FEATURE 5: Client Portal

### Access
- Client receives invite email after intake is completed
- Email contains magic link (Supabase auth)
- On first login: confirm contact info, set notification preferences

### Portal sections

**Appointments**
- List of upcoming sessions with date, time, and therapist name
- "Cancel" button (respects cancellation window — shows fee warning if within window)
- Past sessions list

**Documents**
- All superbills — download as PDF
- Signed intake documents — download as PDF

**Secure Messages**
- Simple inbox: client sends message → therapist receives notification
- Therapist replies from dashboard
- NOT for clinical communications or crisis — disclaimer shown prominently
- SMS sent to therapist when new client message received

**Billing**
- Card on file (last 4 digits shown)
- Update card button (new Stripe Setup Intent)
- Payment history

---

## EDGE CASES TO HANDLE

| Scenario | Behavior |
|---|---|
| Client books but never completes intake | Session created, intake status = pending, therapist notified |
| Client tries to book but no slots available | Shows "no availability" message + contact form |
| Late cancel fee charge fails (card declined) | Therapist notified, session marked late_cancel_unpaid |
| Note signed on wrong client | Therapist must contact support — notes cannot be deleted for HIPAA compliance |
| Therapist goes on vacation | Therapist sets date range as unavailable in availability settings |
| Therapist wants to block individual slot | Can mark specific slot as unavailable from calendar view |
| SMS delivery fails | Retry once after 5 minutes, log failure, therapist notified if all retries fail |
| Intake link expires | Therapist can regenerate from client record |
