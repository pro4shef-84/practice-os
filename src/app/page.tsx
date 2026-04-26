import Link from 'next/link';
import WaitlistForm from '@/components/WaitlistForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* A. Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-gray-900 font-semibold text-lg tracking-tight">
              SoloPractice
            </Link>
            <a
              href="#waitlist"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* B. Hero Section */}
      <section className="bg-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Practice management built for therapists who work alone
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Scheduling, session notes, intake forms, and superbills — in one place, without the
            complexity built for group practices.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#waitlist"
              className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-indigo-700 transition-colors w-full sm:w-auto text-center"
            >
              Join the waitlist
            </a>
            <Link
              href="/templates"
              className="border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-gray-50 hover:border-gray-400 transition-colors w-full sm:w-auto text-center"
            >
              Free note templates
            </Link>
          </div>
        </div>
      </section>

      {/* C. Pain Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Where the time actually goes
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Therapists in solo practice spend an average of 8–10 hours a week on admin that has
              nothing to do with client care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain card 1 */}
            <div className="bg-white rounded-xl p-7 border border-gray-100">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No-shows and late cancellations
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You send reminders. Some clients still cancel last minute. And then you have to
                decide whether to charge the fee — an awkward conversation most therapists
                avoid entirely.
              </p>
            </div>

            {/* Pain card 2 */}
            <div className="bg-white rounded-xl p-7 border border-gray-100">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Session notes that eat your evenings
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                A blank text box at the end of the day is hard to start. Structured templates with
                labeled sections — Subjective, Objective, Assessment, Plan — are easier to complete
                and faster to sign.
              </p>
            </div>

            {/* Pain card 3 */}
            <div className="bg-white rounded-xl p-7 border border-gray-100">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                New client intake stitched together from different tools
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Consent forms in Google Docs, intake questionnaires in Google Forms, card capture in
                Square, scheduling in Calendly. One link that handles all of it doesn&apos;t exist
                yet — unless you pay for SimplePractice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D. Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What&apos;s included
            </h2>
            <p className="text-gray-500 max-w-xl">
              Five features that cover the full administrative lifecycle of a solo practice.
              Nothing for group scheduling, employee management, or insurance billing — because
              you don&apos;t need any of that.
            </p>
          </div>

          <div className="space-y-10">
            {/* Feature 1 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 pb-10 border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Scheduling and SMS reminders
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Clients book through your booking link. SMS reminders go out automatically at 48
                  hours, 24 hours, and 2 hours before the session. If a client cancels within your
                  cancellation window, the late fee charges to their card on file — you don&apos;t
                  have to ask.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 pb-10 border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Structured note templates
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  SOAP, DAP, BIRP, and Progress Note formats with labeled fields for each section —
                  not a blank text box. Notes auto-save every 30 seconds and lock once you sign
                  them. No AI recording. No transcription. You write every word.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 pb-10 border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Digital intake and consent package
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Send new clients one link. They complete consent to treatment, telehealth consent,
                  your cancellation policy, the intake questionnaire, and credit card authorization —
                  all before the first session. Everything is signed and stored in their record.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 pb-10 border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Superbill generator</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  After each session, mark it complete with the CPT code, ICD-10 diagnosis, and fee.
                  A properly formatted superbill PDF — with your NPI, license number, and practice
                  address pre-filled — is ready to email your client in one click. They submit it
                  to their insurance. You don&apos;t deal with insurance at all.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client portal</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Clients log in with a magic link — no password to remember — to view upcoming
                  appointments, download their superbills, and send you a secure message. No clinical
                  notes are ever visible to clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E. Policy enforcement section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Your policies, enforced automatically
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Most therapists don&apos;t enforce their own cancellation policies consistently.
                Not because they don&apos;t believe in them — but because sending a charge to a
                client feels uncomfortable, especially during an already difficult week.
              </p>
              <p className="text-gray-500 leading-relaxed">
                When SoloPractice handles it, there&apos;s no decision to make. The policy you set
                runs automatically. The conversation you were dreading doesn&apos;t happen.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                How it works
              </p>
              <div className="space-y-5">
                {[
                  ['You set your cancellation window', 'e.g. "24 hours before session"'],
                  ['Client books and saves a card at intake', 'Required before their first session'],
                  ['Client cancels within your window', 'Via SMS link or client portal'],
                  ['Late fee charges automatically', 'You get notified. You can waive it if you choose.'],
                ].map(([step, detail], i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F. Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pricing
          </h2>

          {/* Pricing card */}
          <div className="mt-10 bg-white rounded-3xl border-2 border-indigo-100 shadow-lg p-10">
            <div className="mb-2">
              <span className="text-5xl font-bold text-gray-900">$99</span>
              <span className="text-gray-500 text-lg">/month</span>
            </div>
            <p className="text-gray-500 mb-8">
              All 5 features included. No per-client fees. No add-ons. No annual contract required.
            </p>

            <ul className="text-left space-y-3 mb-8">
              {[
                'Scheduling + SMS reminders',
                'SOAP, DAP, BIRP note templates',
                'Digital intake + consent forms',
                'One-click superbill generator',
                'Client portal',
                'HIPAA-compliant storage',
                'Stripe payments (funds go to your bank directly)',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm text-gray-400 mb-8 border-t border-gray-100 pt-6">
              SimplePractice charges $99/month for fewer features — plus per-client fees once you
              grow.
            </p>

            <a
              href="#waitlist"
              className="block w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors text-center"
            >
              Join the waitlist
            </a>
          </div>
        </div>
      </section>

      {/* G. Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Join the waitlist</h2>
            <p className="text-gray-500">
              We&apos;re building SoloPractice with a small group of solo therapists. If you want
              to shape what gets built — and get early access when it&apos;s ready — tell us about
              your practice below.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* H. Free Templates Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Free note templates — no sign-up needed
          </h2>
          <p className="text-gray-500 mb-8">
            SOAP, DAP, and BIRP templates in Google Doc format. Copy to your Drive and use
            them today.
          </p>
          <Link
            href="/templates"
            className="inline-block border border-gray-300 text-gray-700 font-medium px-7 py-3 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            View free templates
          </Link>
        </div>
      </section>

      {/* I. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
            <div>
              <p className="text-white font-semibold text-lg mb-2">SoloPractice</p>
              <p className="text-gray-400 text-sm max-w-xs">
                Practice management for the solo therapist.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <Link href="/templates" className="hover:text-white transition-colors">
                Templates
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-3">
            <p className="text-sm">© 2026 SoloPractice. Built with therapists, for therapists.</p>
            <p className="text-xs text-gray-500">
              SoloPractice operates under signed BAA agreements with Supabase, Stripe, Twilio, and
              Resend.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
