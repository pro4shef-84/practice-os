// Database types for Practice OS
// Matches the schema defined in CLAUDE.md and supabase/migrations/001_initial_schema.sql
// Update this file whenever migrations add/change columns

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      therapists: {
        Relationships: []
        Row: {
          id: string
          user_id: string
          full_name: string | null
          license_type: string | null
          license_number: string | null
          npi: string | null
          practice_name: string | null
          practice_address: Json | null
          phone: string | null
          email: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          cancellation_hours: number
          late_cancel_fee: number | null
          session_fee: number | null
          capacity_max: number
          timezone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          license_type?: string | null
          license_number?: string | null
          npi?: string | null
          practice_name?: string | null
          practice_address?: Json | null
          phone?: string | null
          email?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          cancellation_hours?: number
          late_cancel_fee?: number | null
          session_fee?: number | null
          capacity_max?: number
          timezone?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['therapists']['Insert']>
      }

      availability: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
        }
        Insert: {
          id?: string
          therapist_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['availability']['Insert']>
      }

      clients: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          user_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          diagnosis_code: string | null
          session_frequency_target: number | null
          source: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          user_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          diagnosis_code?: string | null
          session_frequency_target?: number | null
          source?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }

      sessions: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          client_id: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'late_cancel'
          cpt_code: string
          fee_charged: number | null
          fee_collected: number | null
          payment_status: 'pending' | 'paid' | 'waived' | null
          stripe_payment_intent_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          client_id: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'late_cancel'
          cpt_code?: string
          fee_charged?: number | null
          fee_collected?: number | null
          payment_status?: 'pending' | 'paid' | 'waived' | null
          stripe_payment_intent_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }

      notes: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          client_id: string
          session_id: string
          template_type: 'SOAP' | 'DAP' | 'BIRP' | 'progress'
          content: Json
          is_signed: boolean
          signed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          client_id: string
          session_id: string
          template_type: 'SOAP' | 'DAP' | 'BIRP' | 'progress'
          content: Json
          is_signed?: boolean
          signed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }

      intake_documents: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          client_id: string
          document_type: 'consent_to_treat' | 'telehealth_consent' | 'cancellation_policy' | 'intake_form' | 'card_authorization'
          content: Json
          signed_at: string | null
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          client_id: string
          document_type: 'consent_to_treat' | 'telehealth_consent' | 'cancellation_policy' | 'intake_form' | 'card_authorization'
          content: Json
          signed_at?: string | null
          storage_path?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['intake_documents']['Insert']>
      }

      superbills: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          client_id: string
          session_id: string
          generated_at: string
          storage_path: string | null
          emailed_to_client: boolean
          emailed_at: string | null
        }
        Insert: {
          id?: string
          therapist_id: string
          client_id: string
          session_id: string
          generated_at?: string
          storage_path?: string | null
          emailed_to_client?: boolean
          emailed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['superbills']['Insert']>
      }

      reminders: {
        Relationships: []
        Row: {
          id: string
          session_id: string
          client_id: string
          reminder_type: '48hr' | '24hr' | '2hr' | 'confirmation'
          sent_at: string | null
          twilio_message_sid: string | null
          status: 'sent' | 'delivered' | 'failed' | null
        }
        Insert: {
          id?: string
          session_id: string
          client_id: string
          reminder_type: '48hr' | '24hr' | '2hr' | 'confirmation'
          sent_at?: string | null
          twilio_message_sid?: string | null
          status?: 'sent' | 'delivered' | 'failed' | null
        }
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>
      }

      caseload_snapshots: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          snapshot_date: string
          active_count: number
          capacity_max: number
          utilization_pct: number
          at_risk_count: number
          effective_hourly_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          snapshot_date: string
          active_count: number
          capacity_max: number
          utilization_pct: number
          at_risk_count: number
          effective_hourly_rate?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['caseload_snapshots']['Insert']>
      }

      risk_flags: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          client_id: string
          flag_type: 'cancellation_pattern' | 'cadence_drift' | 'long_gap' | 'no_future_session'
          flagged_at: string
          resolved_at: string | null
          resolution: 'intentional' | 're-engaged' | 'discharged' | null
        }
        Insert: {
          id?: string
          therapist_id: string
          client_id: string
          flag_type: 'cancellation_pattern' | 'cadence_drift' | 'long_gap' | 'no_future_session'
          flagged_at?: string
          resolved_at?: string | null
          resolution?: 'intentional' | 're-engaged' | 'discharged' | null
        }
        Update: Partial<Database['public']['Tables']['risk_flags']['Insert']>
      }

      data_imports: {
        Relationships: []
        Row: {
          id: string
          therapist_id: string
          import_type: 'simplepractice_csv' | 'manual'
          imported_at: string
          row_count: number | null
          status: 'processing' | 'complete' | 'failed'
        }
        Insert: {
          id?: string
          therapist_id: string
          import_type: 'simplepractice_csv' | 'manual'
          imported_at?: string
          row_count?: number | null
          status?: 'processing' | 'complete' | 'failed'
        }
        Update: Partial<Database['public']['Tables']['data_imports']['Insert']>
      }

      audit_logs: {
        Relationships: []
        Row: {
          id: string
          actor_id: string | null
          actor_type: 'therapist' | 'client' | null
          action: string
          resource_type: string | null
          resource_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_type?: 'therapist' | 'client' | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
