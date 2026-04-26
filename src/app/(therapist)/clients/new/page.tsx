'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        date_of_birth: dob || undefined,
      }),
    })

    if (res.ok) {
      const client = await res.json()
      router.push(`/clients/${client.id}`)
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to create client. Please try again.')
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to clients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add a client</h1>
        <p className="text-gray-500 text-sm mt-1">
          Once added, you can send them an intake link from their profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First name</label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last name</label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-gray-400 font-normal">(for intake link and superbills)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-gray-400 font-normal">(for SMS reminders)</span>
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

        <div>
          <label htmlFor="dob" className={labelClass}>
            Date of birth <span className="text-gray-400 font-normal">(optional, required for superbills)</span>
          </label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Link
            href="/clients"
            className="flex-1 text-center border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding…' : 'Add client'}
          </button>
        </div>
      </form>
    </div>
  )
}
