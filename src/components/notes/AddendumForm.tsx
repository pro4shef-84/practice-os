'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  noteId: string
}

export default function AddendumForm({ noteId }: Props) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!text.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/notes/${noteId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addendum: text.trim() }),
      })
      if (res.ok) {
        setText('')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to save addendum.')
      }
    } catch {
      setError('Failed to save addendum.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Enter addendum text..."
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={saving || !text.trim()}
        className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Save addendum'}
      </button>
    </div>
  )
}
