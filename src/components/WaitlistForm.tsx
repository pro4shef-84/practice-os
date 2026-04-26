'use client';

import { useState, FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function WaitlistForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [yearsInPractice, setYearsInPractice] = useState('');
  const [currentTool, setCurrentTool] = useState('');
  const [biggestPain, setBiggestPain] = useState('');
  const [adminHours, setAdminHours] = useState('');
  const [openFeedback, setOpenFeedback] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          email,
          yearsInPractice,
          currentTool,
          biggestPain,
          adminHours,
          openFeedback: openFeedback.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data: unknown = await response.json();
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Something went wrong';
        throw new Error(message);
      }

      setFormState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re on the list.</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          We read every response. We&apos;ll be in touch before beta opens.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5"
    >
      <p className="text-sm text-gray-500 pb-1">
        A few questions help us build the right thing. Takes about 90 seconds.
      </p>

      {/* First name */}
      <div>
        <label htmlFor="firstName" className={labelClass}>
          First name
        </label>
        <input
          id="firstName"
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Jane"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Work email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@yourpractice.com"
          className={inputClass}
        />
      </div>

      {/* Years in practice */}
      <div>
        <label htmlFor="yearsInPractice" className={labelClass}>
          How long have you been in solo practice?
        </label>
        <select
          id="yearsInPractice"
          required
          value={yearsInPractice}
          onChange={(e) => setYearsInPractice(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>Select one</option>
          <option value="planning">Not yet — I&apos;m planning to go solo</option>
          <option value="less_than_1">Less than 1 year</option>
          <option value="1_to_3">1–3 years</option>
          <option value="3_to_5">3–5 years</option>
          <option value="5_plus">5+ years</option>
        </select>
      </div>

      {/* Current tool */}
      <div>
        <label htmlFor="currentTool" className={labelClass}>
          What do you currently use to manage your practice?
        </label>
        <select
          id="currentTool"
          required
          value={currentTool}
          onChange={(e) => setCurrentTool(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>Select one</option>
          <option value="simple_practice">SimplePractice</option>
          <option value="therapy_notes">TherapyNotes</option>
          <option value="google_docs">Google Docs / Sheets / Forms</option>
          <option value="paper">Paper charts + manual processes</option>
          <option value="nothing">Nothing formal yet</option>
          <option value="other">Something else</option>
        </select>
      </div>

      {/* Biggest pain */}
      <div>
        <label htmlFor="biggestPain" className={labelClass}>
          What takes up most of your non-session admin time?
        </label>
        <select
          id="biggestPain"
          required
          value={biggestPain}
          onChange={(e) => setBiggestPain(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>Select one</option>
          <option value="no_shows">No-shows and chasing late cancel fees</option>
          <option value="notes">Writing session notes</option>
          <option value="intake">New client intake and paperwork</option>
          <option value="superbills">Creating superbills for clients</option>
          <option value="multiple_tools">Juggling multiple tools that don&apos;t talk to each other</option>
          <option value="other">Something else</option>
        </select>
      </div>

      {/* Admin hours per week */}
      <div>
        <label htmlFor="adminHours" className={labelClass}>
          Roughly how many hours per week do you spend on admin outside of sessions?
        </label>
        <select
          id="adminHours"
          required
          value={adminHours}
          onChange={(e) => setAdminHours(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>Select one</option>
          <option value="less_2">Less than 2 hours</option>
          <option value="2_to_5">2–5 hours</option>
          <option value="5_to_10">5–10 hours</option>
          <option value="over_10">More than 10 hours</option>
          <option value="unknown">I&apos;ve never tracked it</option>
        </select>
      </div>

      {/* Open feedback */}
      <div>
        <label htmlFor="openFeedback" className={labelClass}>
          What&apos;s one thing you wish your current setup did better?{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="openFeedback"
          value={openFeedback}
          onChange={(e) => setOpenFeedback(e.target.value)}
          placeholder="Anything you want us to know..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Error state */}
      {formState === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {errorMessage || 'Something went wrong — please try again.'}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-lg text-base hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {formState === 'submitting' ? 'Submitting...' : 'Join the waitlist'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        We read every response. No spam, unsubscribe any time.
      </p>
    </form>
  );
}
