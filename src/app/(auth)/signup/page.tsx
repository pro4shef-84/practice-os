'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'account' | 'profile'

const US_TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',     label: 'Central Time (CT)' },
  { value: 'America/Denver',      label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage',   label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HST)' },
]

const LICENSE_TYPES = ['LCSW', 'LMFT', 'LPC', 'LCPC', 'PhD', 'PsyD', 'MD', 'LMSW', 'Other']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 — profile
  const [fullName, setFullName] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [npi, setNpi] = useState('')
  const [sessionFee, setSessionFee] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')

  async function handleAccountStep(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setStep('profile')
  }

  async function handleProfileStep(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !authData.user) {
      setError(authError?.message ?? 'Could not create account. Try a different email.')
      setLoading(false)
      return
    }

    // 2. Create therapist profile
    const { error: profileError } = await supabase.from('therapists').insert({
      user_id: authData.user.id,
      full_name: fullName.trim(),
      practice_name: practiceName.trim() || null,
      license_type: licenseType || null,
      license_number: licenseNumber.trim() || null,
      npi: npi.trim() || null,
      session_fee: sessionFee ? Math.round(parseFloat(sessionFee) * 100) : null,
      timezone,
      email,
    })

    if (profileError) {
      setError('Account created but profile setup failed. Sign in and complete your profile in Settings.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          <div className={`h-1 flex-1 rounded-full ${step === 'account' ? 'bg-indigo-600' : 'bg-indigo-600'}`} />
          <div className={`h-1 flex-1 rounded-full ${step === 'profile' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 'account' ? 'Create your account' : 'Set up your practice'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'account' ? 'Step 1 of 2' : 'Step 2 of 2 — you can update these any time in Settings'}
        </p>
      </div>

      {step === 'account' && (
        <form onSubmit={handleAccountStep} className="space-y-5">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8+ characters"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            Continue
          </button>
        </form>
      )}

      {step === 'profile' && (
        <form onSubmit={handleProfileStep} className="space-y-5">
          <div>
            <label htmlFor="fullName" className={labelClass}>Your full name</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Smith"
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
                {LICENSE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
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
          </div>

          <div>
            <label htmlFor="timezone" className={labelClass}>Your timezone</label>
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('account')}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !fullName.trim()}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up…' : 'Create account'}
            </button>
          </div>
        </form>
      )}

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
