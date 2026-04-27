import { z } from 'zod'

const envSchema = z.object({
  // Supabase — required when Phase 0 begins
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Anthropic — required when Phase 1 (notes) begins
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Stripe — required when Phase 2 (scheduling) begins
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Twilio — required when Phase 2 (scheduling) begins
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  // Resend — active now (waitlist emails)
  RESEND_API_KEY: z.string().min(1).optional(),
  WAITLIST_NOTIFICATION_EMAIL: z.string().email().default('v.praveen.rao@gmail.com'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Practice OS'),
})

function validateEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('[env] Invalid environment variables:\n', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables — see logs above')
  }

  if (!parsed.data.RESEND_API_KEY) {
    console.warn('[env] RESEND_API_KEY not set — emails will be logged but not sent')
  }

  return parsed.data
}

export const env = validateEnv()

// Runtime guard — call inside route handlers that need a specific var
// e.g. const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
export function requireEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const value = env[key]
  if (value === undefined || value === null) {
    throw new Error(`[env] Required environment variable ${key} is not set`)
  }
  return value as NonNullable<(typeof env)[K]>
}
