'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type TemplateType = 'SOAP' | 'DAP' | 'BIRP' | 'progress'

interface SoapContent {
  subjective: string
  objective: string
  assessment: string
  si_hi_present: boolean
  si_hi_details: string
  plan: string
}

interface DapContent {
  data: string
  assessment: string
  plan: string
}

interface BirpContent {
  behavior: string
  intervention: string
  response: string
  plan: string
}

interface ProgressContent {
  session_focus: string
  progress_toward_goals: string
  plan: string
}

type NoteContent = SoapContent | DapContent | BirpContent | ProgressContent

interface Props {
  noteId: string
  templateType: TemplateType
  initialContent: Record<string, unknown>
  isSigned: boolean
  signedAt: string | null
}

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

const FIELD_LABELS: Record<string, string> = {
  subjective: 'Subjective',
  objective: 'Objective',
  assessment: 'Assessment',
  plan: 'Plan',
  data: 'Data',
  behavior: 'Behavior',
  intervention: 'Intervention',
  response: 'Response',
  session_focus: 'Session focus',
  progress_toward_goals: 'Progress toward goals',
}

const FIELD_HINTS: Record<string, string> = {
  subjective: "Client's reported mood, presenting concerns, what they brought to session",
  objective: 'Your clinical observations — affect, appearance, engagement, mental status',
  assessment: 'Your clinical impression, progress toward goals',
  plan: 'Interventions, homework, focus for next session',
  data: 'What was reported and observed this session',
  behavior: 'Presenting concerns and behaviors',
  intervention: 'Techniques and approaches used',
  response: "Client's response to interventions",
  session_focus: 'What this session focused on',
  progress_toward_goals: 'Movement toward treatment goals',
}

const TEMPLATE_FIELDS: Record<TemplateType, string[]> = {
  SOAP: ['subjective', 'objective', 'assessment', 'plan'],
  DAP: ['data', 'assessment', 'plan'],
  BIRP: ['behavior', 'intervention', 'response', 'plan'],
  progress: ['session_focus', 'progress_toward_goals', 'plan'],
}

export default function NoteEditor({ noteId, templateType, initialContent, isSigned, signedAt }: Props) {
  const [content, setContent] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    for (const field of TEMPLATE_FIELDS[templateType]) {
      result[field] = typeof initialContent[field] === 'string' ? (initialContent[field] as string) : ''
    }
    return result
  })
  const [siHiPresent, setSiHiPresent] = useState<boolean>(
    templateType === 'SOAP' ? Boolean(initialContent.si_hi_present) : false
  )
  const [siHiDetails, setSiHiDetails] = useState<string>(
    templateType === 'SOAP' ? (typeof initialContent.si_hi_details === 'string' ? initialContent.si_hi_details : '') : ''
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (contentToSave: Record<string, string>, siPresent: boolean, siDetails: string) => {
      setSaveStatus('saving')
      const payload: Record<string, unknown> = { ...contentToSave }
      if (templateType === 'SOAP') {
        payload.si_hi_present = siPresent
        payload.si_hi_details = siDetails
      }
      try {
        const res = await fetch(`/api/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: payload }),
        })
        setSaveStatus(res.ok ? 'saved' : 'error')
      } catch {
        setSaveStatus('error')
      }
    },
    [noteId, templateType]
  )

  const scheduleSave = useCallback(
    (nextContent: Record<string, string>, siPresent: boolean, siDetails: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setSaveStatus('unsaved')
      debounceRef.current = setTimeout(() => {
        save(nextContent, siPresent, siDetails)
      }, 300)
    },
    [save]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleFieldChange(field: string, value: string) {
    const next = { ...content, [field]: value }
    setContent(next)
    scheduleSave(next, siHiPresent, siHiDetails)
  }

  function handleSiHiChange(checked: boolean) {
    setSiHiPresent(checked)
    scheduleSave(content, checked, siHiDetails)
  }

  function handleSiHiDetailsChange(value: string) {
    setSiHiDetails(value)
    scheduleSave(content, siHiPresent, value)
  }

  const fields = TEMPLATE_FIELDS[templateType]
  const isReadOnly = isSigned

  const textareaClass = `w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
    isReadOnly
      ? 'border-gray-100 bg-gray-50 text-gray-700 cursor-default'
      : 'border-gray-200 bg-white hover:border-gray-300'
  }`

  return (
    <div className="space-y-6">
      {/* Save indicator */}
      {!isReadOnly && (
        <div className="flex items-center justify-end gap-2 h-5">
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              Save failed — check connection
            </span>
          )}
        </div>
      )}

      {isReadOnly && signedAt && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-green-700">
            Signed and locked on {new Date(signedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(signedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Note fields */}
      {fields.map(field => (
        <div key={field}>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            {FIELD_LABELS[field]}
          </label>
          {FIELD_HINTS[field] && !isReadOnly && (
            <p className="text-xs text-gray-400 mb-2">{FIELD_HINTS[field]}</p>
          )}
          <textarea
            value={content[field] ?? ''}
            onChange={e => handleFieldChange(field, e.target.value)}
            readOnly={isReadOnly}
            rows={5}
            placeholder={isReadOnly ? '' : FIELD_HINTS[field]}
            className={textareaClass}
          />
        </div>
      ))}

      {/* SI/HI section — SOAP only */}
      {templateType === 'SOAP' && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={siHiPresent}
              onChange={e => handleSiHiChange(e.target.checked)}
              disabled={isReadOnly}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-800">
              Suicidal ideation or homicidal ideation present
            </span>
          </label>
          {siHiPresent && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Details</label>
              <textarea
                value={siHiDetails}
                onChange={e => handleSiHiDetailsChange(e.target.value)}
                readOnly={isReadOnly}
                rows={3}
                placeholder="Describe ideation, risk level, safety plan..."
                className={`${textareaClass} mt-0`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
