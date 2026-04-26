import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getAvailableSlots } from '@/lib/utils/slots'
import BookingForm from '@/components/scheduling/BookingForm'

export default async function BookingPage({ params }: { params: Promise<{ therapistSlug: string }> }) {
  const { therapistSlug } = await params

  // therapistSlug is the therapist's UUID (Phase 7 adds pretty slugs)
  const supabase = await createClient()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('id, full_name, practice_name, session_fee, cancellation_hours, late_cancel_fee, timezone')
    .eq('id', therapistSlug)
    .single()

  if (!therapist) notFound()

  const slots = await getAvailableSlots(therapist.id, 4)

  const displayName = therapist.practice_name ?? therapist.full_name ?? 'Your therapist'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          {therapist.session_fee && (
            <p className="text-gray-500 text-sm mt-1">
              ${(therapist.session_fee / 100).toFixed(0)} per session
            </p>
          )}
          {therapist.cancellation_hours > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Free cancellation up to {therapist.cancellation_hours} hours before your appointment
              {therapist.late_cancel_fee ? ` · ${(therapist.late_cancel_fee / 100).toFixed(0)} late cancel fee` : ''}
            </p>
          )}
        </div>

        {slots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">No available appointments in the next 4 weeks.</p>
            <p className="text-gray-400 text-xs mt-2">Please contact the therapist directly to schedule.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <BookingForm
              therapistId={therapist.id}
              slots={slots}
            />
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Practice OS
        </p>
      </div>
    </div>
  )
}
