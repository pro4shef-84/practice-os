# Practice OS — Third-Party Accounts

Every service you need to create an account for before writing code. Sign up in this order — Supabase first since everything else connects to it.

> **HIPAA note:** Supabase, Stripe, Twilio, and Resend all require a signed Business Associate Agreement (BAA) before the app handles real client data. Do this before launch, not after.

---

## 1. Supabase
**What it does:** PostgreSQL database, authentication (email/password + magic link), and file storage. The core of the app.

**Sign up:** https://supabase.com → Create a new project (choose a US region for HIPAA)

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| Project URL | Project Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |
| Anon (public) key | Project Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Service role key | Project Settings → API | `SUPABASE_SERVICE_ROLE_KEY` |

**HIPAA:** Request a BAA through Supabase's Team or Enterprise plan before going live.

---

## 2. Stripe
**What it does:** Captures client payment cards at booking and intake, charges late cancel fees automatically, and handles the therapist's own $79/month subscription.

**Sign up:** https://stripe.com → Create an account → Enable your account (requires business details)

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| Secret key | Developers → API keys | `STRIPE_SECRET_KEY` |
| Publishable key | Developers → API keys | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Webhook secret | Developers → Webhooks → Add endpoint | `STRIPE_WEBHOOK_SECRET` |

**Webhook endpoint to register:** `https://your-domain.com/api/webhooks/stripe`

**Events to listen for:** `payment_intent.succeeded`, `payment_intent.payment_failed`, `setup_intent.succeeded`, `customer.subscription.deleted`

**HIPAA:** Stripe is HIPAA-eligible. Sign the BAA in Dashboard → Settings → Business settings.

---

## 3. Twilio
**What it does:** Sends SMS reminders to clients — booking confirmation, 48hr, 24hr, and 2hr reminders, and handles CANCEL replies.

**Sign up:** https://twilio.com → Create an account → Verify your phone number

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| Account SID | Console Dashboard (top of page) | `TWILIO_ACCOUNT_SID` |
| Auth token | Console Dashboard (top of page) | `TWILIO_AUTH_TOKEN` |
| Phone number | Phone Numbers → Manage → Buy a number (get a US number with SMS capability) | `TWILIO_PHONE_NUMBER` |

**After buying a number:** Configure the number's webhook for incoming SMS to `https://your-domain.com/api/webhooks/twilio` so CANCEL replies are processed.

**HIPAA:** Twilio offers a BAA — request it through their support or compliance portal.

---

## 4. Resend
**What it does:** Sends transactional emails — intake links to clients, superbill delivery, therapist notifications, and the Friday weekly digest.

**Sign up:** https://resend.com → Create an account → Add and verify your sending domain

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| API key | API Keys → Create API Key | `RESEND_API_KEY` |

**Domain setup:** Add your domain's DNS records in Resend → Domains. You'll need access to your domain's DNS settings (wherever you bought the domain).

**HIPAA:** Resend offers a BAA for paid plans.

---

## 5. Anthropic
**What it does:** Powers the AI features — Claude Sonnet for the weekly practice digest and at-risk client explanations, Claude Haiku for short classifications and tooltips.

**Sign up:** https://console.anthropic.com → Create an account → Add a payment method

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| API key | API Keys → Create Key | `ANTHROPIC_API_KEY` |

**Models used in this project:**
- `claude-sonnet-4-6` — weekly digests, at-risk explanations, financial summaries
- `claude-haiku-4-5-20251001` — short labels, classifications, tooltips

**No BAA needed** — PHI is never sent to the Claude API. Client names and diagnoses are pseudonymized to `client_id` before any API call.

---

## 6. Vercel
**What it does:** Hosts the Next.js app and runs cron jobs for SMS reminder scheduling and daily caseload snapshots.

**Sign up:** https://vercel.com → Create an account → Connect your GitHub repo

**What to grab after signing up:**
| Credential | Where to find it | Env var |
|---|---|---|
| App URL (auto-assigned on deploy) | Project → Deployments | `NEXT_PUBLIC_APP_URL` |

**After deploying:** Set all env vars above in Vercel → Project → Settings → Environment Variables. Vercel does not need an API key in your `.env` — you configure it through their dashboard.

---

## Summary checklist

- [ ] Supabase account created, project in US region, BAA requested
- [ ] Stripe account created, live mode enabled, webhook endpoint registered, BAA signed
- [ ] Twilio account created, US phone number purchased, incoming SMS webhook set
- [ ] Resend account created, sending domain verified, BAA requested
- [ ] Anthropic account created, API key generated, billing method added
- [ ] Vercel account created, GitHub repo connected

---

## `.env.local` template

Copy this into `.env.local` at the project root and fill in each value:

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Practice OS

# SimplePractice (optional — leave blank until Phase 6 direct API integration)
SIMPLEPRACTICE_API_KEY=
```
