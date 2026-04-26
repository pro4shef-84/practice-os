'use client'

import { useState, useEffect, FormEvent } from 'react'

const US_TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',     label: 'Central Time (CT)' },
  { value: 'America/Denver',      label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage',   label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HST)' },
]

const LICENSE_TYPES = ['LCSW', 'LMFT', 'LPC', 'LCPC', 'PhD', 'PsyD', 'MD', 'LMSW', 'Other']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Availability {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface TherapistProfile {
  full_name: string
  practice_name: string
  license_type: string
  license_number: string
  npi: string
  phone: string
  email: string
  session_fee: number | null
  cancellation_hours: number
  late_cancel_fee: number | null
  capacity_max: number | null
  timezone: string
  practice_address: {
    street: string
    city: string
    state: string
    zip: string
  } | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAvail, setSavingAvail] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [npi, setNpi] = useState('')
  const [phone, setPhone] = useState('')
  const [sessionFee, setSessionFee] = useState('')
  const [cancellationHours, setCancellationHours] = useState('24')
  const [lateCancelFee, setLateCancelFee] = useState('')
  const [capacityMax, setCapacityMax] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  useEffect(() => {
    async function load() {
      const [profileRes, availRes] = await Promise.all([
        fetch('/api/therapist'),
        fetch('/api/therapist/availability'),
      ])

      if (profileRes.ok) {
        const data: TherapistProfile = await profileRes.json()
        setProfile(data)
        setFullName(data.full_name ?? '')
        setPracticeName(data.practice_name ?? '')
        setLicenseType(data.license_type ?? '')
        setLicenseNumber(data.license_number ?? '')
        setNpi(data.npi ?? '')
        setPhone(data.phone ?? '')
        setSessionFee(data.session_fee ? String(data.session_fee / 100) : '')
        setCancellationHours(String(data.cancellation_hours ?? 24))
        setLateCancelFee(data.late_cancel_fee ? String(data.late_cancel_fee / 100) : '')
        setCapacityMax(data.capacity_max ? String(data.capacity_max) : '')
        setTimezone(data.timezone ?? 'America/New_York')
        setStreet(data.practice_address?.street ?? '')
        setCity(data.practice_address?.city ?? '')
        setState(data.practice_address?.state ?? '')
        setZip(data.practice_address?.zip ?? '')
      }

      if (availRes.ok) {
        const data = await availRes.json()
        setAvailability(data)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const body: Record<string, unknown> = {
      full_name: fullName.trim(),
      practice_name: practiceName.trim() || undefined,
      license_type: licenseType || undefined,
      license_number: licenseNumber.trim() || undefined,
      npi: npi.trim() || undefined,
      phone: phone.trim() || undefined,
      session_fee: sessionFee ? Math.round(parseFloat(sessionFee) * 100) : undefined,
      cancellation_hours: parseInt(cancellationHours),
      late_cancel_fee: lateCancelFee ? Math.round(parseFloat(lateCancelFee) * 100) : undefined,
      capacity_max: capacityMax ? parseInt(capacityMax) : undefined,
      timezone,
    }

    if (street && city && state && zip) {
      body.practice_address = { street: street.trim(), city: city.trim(), state: state.trim(), zip: zip.trim() }
    }

    const res = await fetch('/api/therapist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setSuccessMsg('Profile saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setError('Failed to save. Please try again.')
    }

    setSaving(false)
  }

  function toggleDay(day: number) {
    setAvailability(prev => {
      const existing = prev.find(a => a.day_of_week === day)
      if (existing) {
        return prev.map(a => a.day_of_week === day ? { ...a, is_active: !a.is_active } : a)
      }
      return [...prev, { day_of_week: day, start_time: '09:00', end_time: '17:00', is_active: true }]
    })
  }

  function updateAvailTime(day: number, field: 'start_time' | 'end_time', value: string) {
    setAvailability(prev =>
      prev.map(a => a.day_of_week === day ? { ...a, [field]: value } : a)
    )
  }

  async function handleSaveAvailability() {
    setSavingAvail(true)
    setError('')

    const activeSlots = availability.filter(a => a.is_active)
    const res = await fetch('/api/therapist/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activeSlots),
    })

    if (res.ok) {
      setSuccessMsg('Availability saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } else {
      setError('Failed to save availability. Please try again.')
    }

    setSavingAvail(false)
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, practice details, and availability</p>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Profile section */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Your profile</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className={labelClass}>Full name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="practiceName" className={labelClass}>
                Practice name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="practiceName"
                type="text"
                value={practiceName}
                onChange={e => setPracticeName(e.target.value)}
                placeholder="Smith Therapy, PLLC"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="licenseType" className={labelClass}>License type</label>
                <select
                  id="licenseType"
                  value={licenseType}
                  onChange={e => setLicenseType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="licenseNumber" className={labelClass}>License number</label>
                <input
                  id="licenseNumber"
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="npi" className={labelClass}>
                  NPI <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="npi"
                  type="text"
                  value={npi}
                  onChange={e => setNpi(e.target.value)}
                  placeholder="10 digits"
                  maxLength={10}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className={labelClass}>Timezone</label>
              <select
                id="timezone"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className={inputClass}
              >
                {US_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Practice address */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Practice address</h2>
          <p className="text-xs text-gray-400 mb-5">Required for superbill generation</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="street" className={labelClass}>Street address</label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="123 Main St, Suite 200"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label htmlFor="city" className={labelClass}>City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClass}>State</label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="NY"
                  maxLength={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="zip" className={labelClass}>ZIP</label>
                <input
                  id="zip"
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  placeholder="10001"
                  maxLength={10}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Billing & policy */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Billing &amp; cancellation policy</h2>
          <p className="text-xs text-gray-400 mb-5">These defaults apply to all sessions unless overridden</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sessionFee" className={labelClass}>Session fee ($)</label>
                <input
                  id="sessionFee"
                  type="number"
                  min="0"
                  step="5"
                  value={sessionFee}
                  onChange={e => setSessionFee(e.target.value)}
                  placeholder="175"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="capacityMax" className={labelClass}>
                  Max clients <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="capacityMax"
                  type="number"
                  min="1"
                  max="100"
                  value={capacityMax}
                  onChange={e => setCapacityMax(e.target.value)}
                  placeholder="20"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cancellationHours" className={labelClass}>Free cancellation window</label>
                <select
                  id="cancellationHours"
                  value={cancellationHours}
                  onChange={e => setCancellationHours(e.target.value)}
                  className={inputClass}
                >
                  <option value="0">No free cancel</option>
                  <option value="12">12 hours before</option>
                  <option value="24">24 hours before</option>
                  <option value="48">48 hours before</option>
                  <option value="72">72 hours before</option>
                </select>
              </div>
              <div>
                <label htmlFor="lateCancelFee" className={labelClass}>
                  Late cancel fee ($) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="lateCancelFee"
                  type="number"
                  min="0"
                  step="5"
                  value={lateCancelFee}
                  onChange={e => setLateCancelFee(e.target.value)}
                  placeholder="100"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !fullName.trim()}
            className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      {/* Availability section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Weekly availability</h2>
        <p className="text-xs text-gray-400 mb-5">When clients can book sessions with you</p>

        <div className="space-y-3">
          {DAYS.map((day, index) => {
            const slot = availability.find(a => a.day_of_week === index)
            const isActive = slot?.is_active ?? false

            return (
              <div key={index} className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`w-12 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>

                {isActive && slot ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.start_time}
                      onChange={e => updateAvailTime(index, 'start_time', e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={slot.end_time}
                      onChange={e => updateAvailTime(index, 'end_time', e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Unavailable</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSaveAvailability}
            disabled={savingAvail}
            className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingAvail ? 'Saving…' : 'Save availability'}
          </button>
        </div>
      </section>
    </div>
  )
}
