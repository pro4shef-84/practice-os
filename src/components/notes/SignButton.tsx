'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  noteId: string
  isSigned: boolean
}

export default function SignButton({ noteId, isSigned }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  if (isSigned) return null

  async function handleSign() {
    setSigning(true)
    setError('')
    try {
      const res = await fetch(`/api/notes/${noteId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        setShowConfirm(false)
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to sign note. Please try again.')
      }
    } catch {
      setError('Failed to sign note. Please try again.')
    }
    setSigning(false)
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Sign and lock note
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Sign and lock this note?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Once signed, this note cannot be edited. You can add a timestamped addendum later if needed.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setError('') }}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Go back
              </button>
              <button
                onClick={handleSign}
                disabled={signing}
                className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signing ? 'Signing…' : 'Sign and lock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
