# SoloPractice — Landing Page

Pre-launch validation landing page for SoloPractice: practice management software built exclusively for solo therapists.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Resend for email.

## Running locally

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and add your RESEND_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main landing page with waitlist signup form |
| `/templates` | Free therapy note template download page (SOAP, DAP, BIRP) |

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Recommended | Resend API key for sending waitlist emails. If not set, signups are logged to console only. |
| `WAITLIST_NOTIFICATION_EMAIL` | No | Email to receive signup notifications. Defaults to `anil.vijay@gmail.com`. |
| `NEXT_PUBLIC_APP_URL` | No | Full URL of the deployed app. Defaults to `http://localhost:3000`. |

## Deploying to Vercel

1. Push to GitHub.
2. Import the repository in Vercel — it will auto-detect Next.js.
3. Set the environment variables in the Vercel project settings.
4. Deploy.

The `vercel.json` at the root ensures correct framework detection.

## Waitlist API

`POST /api/waitlist` accepts JSON:

```json
{
  "firstName": "Jane",
  "email": "jane@example.com",
  "yearsInPractice": "3_to_5"
}
```

Valid values for `yearsInPractice`: `less_than_1`, `1_to_3`, `3_to_5`, `5_plus`, `planning`.

On success, sends two emails via Resend:
- Notification to `WAITLIST_NOTIFICATION_EMAIL` with signup details
- Confirmation to the person who signed up
