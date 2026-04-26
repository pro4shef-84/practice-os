'use client'

import { useState, FormEvent } from 'react'

interface Slot {
  iso: string
  display: string
}

interface Props {
  therapistId: string
  slots: Slot[]
}

type Step = 'slot' | 'details' | 'confirmed'

export default function BookingForm({ therapistId, slots }: Props) {
  const [step, setStep] = useState<Step>('slot')
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Group slots by date for display
  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const date = slot.iso.split('T')[0]
    acc[date] = acc[date] ?? []
    acc[date].push(slot)
    return acc
  }, {})

  async function handleBook(e: FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        therapist_id: therapistId,
        scheduled_at: selectedSlot.iso,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
      }),
    })

    if (res.ok) {
      setStep('confirmed')
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  if (step === 'confirmed') {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re booked!</h2>
        <p className="text-gray-500 text-sm mb-1">{selectedSlot?.display}</p>
        {phone && (
          <p className="text-gray-400 text-xs mt-3">
            A confirmation text was sent to {phone}
          </p>
        )}
      </div>
    )
  }

  if (step === 'details') {
    return (
      <form onSubmit={handleBook} className="p-6 space-y-4">
        <div>
          <button
            type="button"
            onClick={() => setStep('slot')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm font-medium text-indigo-800">{selectedSlot?.display}</p>
          </div>

          <h2 className="text-base font-semibold text-gray-900 mb-4">Your information</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
            <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
            <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone <span className="text-gray-400 font-normal">(for appointment reminders)</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(555) 000-0000"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !firstName.trim() || !lastName.trim() || !phone.trim()}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking…' : 'Confirm appointment'}
        </button>

        <p className="text-xs text-center text-gray-400">
          You&apos;ll receive a text confirmation after booking
        </p>
      </form>
    )
  }

  // Slot selection
  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Select a time</h2>

      <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
        {Object.entries(slotsByDate).map(([date, dateSlots]) => {
          const dateDisplay = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })
          return (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{dateDisplay}</p>
              <div className="grid grid-cols-3 gap-2">
                {dateSlots.map(slot => {
                  const timeStr = slot.display.split(' at ')[1]
                  const isSelected = selectedSlot?.iso === slot.iso
                  return (
                    <button
                      key={slot.iso}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-700'
                      }`}
                    >
                      {timeStr}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => selectedSlot && setStep('details')}
        disabled={!selectedSlot}
        className="w-full mt-5 bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selectedSlot ? `Continue with ${selectedSlot.display.split(' at ')[1]}` : 'Select a time to continue'}
      </button>
    </div>
  )
}
