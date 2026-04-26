import { z } from 'zod'

// ─── Therapist ────────────────────────────────────────────────────────────────

export const updateTherapistSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  license_type: z.string().max(50).optional(),
  license_number: z.string().max(100).optional(),
  npi: z.string().length(10).optional(),
  practice_name: z.string().max(200).optional(),
  practice_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string(),
  }).optional(),
  phone: z.string().max(20).optional(),
  session_fee: z.number().int().positive().optional(),          // in cents
  cancellation_hours: z.number().int().min(0).max(72).optional(),
  late_cancel_fee: z.number().int().min(0).optional(),          // in cents
  capacity_max: z.number().int().min(1).max(100).optional(),
  timezone: z.string().optional(),
})

// ─── Availability ─────────────────────────────────────────────────────────────

export const upsertAvailabilitySchema = z.array(z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_active: z.boolean().default(true),
}))

// ─── Clients ──────────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  diagnosis_code: z.string().max(20).optional(),
  session_frequency_target: z.number().int().min(1).max(30).optional(),
  source: z.string().max(100).optional(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  is_active: z.boolean().optional(),
})

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  client_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(180).default(50),
  cpt_code: z.string().default('90837'),
  fee_charged: z.number().int().positive().optional(),          // in cents
})

export const updateSessionSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show', 'late_cancel']).optional(),
  cpt_code: z.string().optional(),
  fee_charged: z.number().int().positive().optional(),
  fee_collected: z.number().int().min(0).optional(),
  payment_status: z.enum(['pending', 'paid', 'waived']).optional(),
  cancellation_reason: z.string().max(500).optional(),
  cancelled_at: z.string().datetime().optional(),
})

export const completeSessionSchema = z.object({
  cpt_code: z.string().default('90837'),
  diagnosis_code: z.string().max(20),
  fee_charged: z.number().int().positive(),                     // in cents
})

// ─── Notes ────────────────────────────────────────────────────────────────────

const soapContentSchema = z.object({
  subjective: z.string().max(5000).default(''),
  objective: z.string().max(5000).default(''),
  assessment: z.string().max(5000).default(''),
  plan: z.string().max(5000).default(''),
  si_hi_present: z.boolean().default(false),
  si_hi_details: z.string().max(2000).optional(),
})

const dapContentSchema = z.object({
  data: z.string().max(5000).default(''),
  assessment: z.string().max(5000).default(''),
  plan: z.string().max(5000).default(''),
})

const birpContentSchema = z.object({
  behavior: z.string().max(5000).default(''),
  intervention: z.string().max(5000).default(''),
  response: z.string().max(5000).default(''),
  plan: z.string().max(5000).default(''),
})

const progressContentSchema = z.object({
  session_focus: z.string().max(5000).default(''),
  progress_toward_goals: z.string().max(5000).default(''),
  plan: z.string().max(5000).default(''),
})

export const createNoteSchema = z.discriminatedUnion('template_type', [
  z.object({ template_type: z.literal('SOAP'), session_id: z.string().uuid(), client_id: z.string().uuid(), content: soapContentSchema }),
  z.object({ template_type: z.literal('DAP'),  session_id: z.string().uuid(), client_id: z.string().uuid(), content: dapContentSchema }),
  z.object({ template_type: z.literal('BIRP'), session_id: z.string().uuid(), client_id: z.string().uuid(), content: birpContentSchema }),
  z.object({ template_type: z.literal('progress'), session_id: z.string().uuid(), client_id: z.string().uuid(), content: progressContentSchema }),
])

export const updateNoteSchema = z.object({
  content: z.record(z.string(), z.unknown()),
})

export const signNoteSchema = z.object({
  note_id: z.string().uuid(),
})

export const addendumSchema = z.object({
  note_id: z.string().uuid(),
  text: z.string().min(1).max(5000),
})

// ─── Intake ───────────────────────────────────────────────────────────────────

export const createIntakeLinkSchema = z.object({
  client_id: z.string().uuid(),
})

export const completeIntakeSchema = z.object({
  token: z.string().min(1),
  consent_to_treat: z.boolean().refine(v => v === true, 'Consent to treat is required'),
  telehealth_consent: z.boolean().optional(),
  intake_responses: z.record(z.string(), z.unknown()),
  stripe_setup_intent_id: z.string().min(1),
})

// ─── Superbills ───────────────────────────────────────────────────────────────

export const generateSuperbillSchema = z.object({
  session_id: z.string().uuid(),
  cpt_code: z.string().default('90837'),
  diagnosis_code: z.string().max(20),
  fee_charged: z.number().int().positive(),                     // in cents
  fee_collected: z.number().int().min(0),                       // in cents
})
