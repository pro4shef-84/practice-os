import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Therapy Note Templates — SOAP, DAP, BIRP | SoloPractice',
  description:
    'Download free SOAP, DAP, and BIRP therapy note templates in Google Doc format. Structured fields, ready to copy to your Drive. No email required.',
};

interface TemplateSection {
  label: string;
  description: string;
}

interface Template {
  acronym: string;
  name: string;
  sections: TemplateSection[];
  docUrl: string;
}

const templates: Template[] = [
  {
    acronym: 'SOAP',
    name: 'SOAP Note Template',
    docUrl: '#',
    sections: [
      {
        label: 'S — Subjective',
        description: "Client's reported mood, presenting concerns, events since last session",
      },
      {
        label: 'O — Objective',
        description: 'Therapist observations (affect, behavior, appearance, speech)',
      },
      {
        label: 'A — Assessment',
        description: 'Clinical impression, progress toward treatment goals, risk assessment',
      },
      {
        label: 'P — Plan',
        description: 'Interventions used, homework assigned, plan for next session',
      },
    ],
  },
  {
    acronym: 'DAP',
    name: 'DAP Note Template',
    docUrl: '#',
    sections: [
      {
        label: 'D — Data',
        description: 'What the client reported and what was observed',
      },
      {
        label: 'A — Assessment',
        description: "Therapist's clinical interpretation",
      },
      {
        label: 'P — Plan',
        description: 'Next steps, interventions, goals',
      },
    ],
  },
  {
    acronym: 'BIRP',
    name: 'BIRP Note Template',
    docUrl: '#',
    sections: [
      {
        label: 'B — Behavior',
        description: "Client's presenting behavior and reported concerns",
      },
      {
        label: 'I — Intervention',
        description: 'Therapeutic techniques and interventions used',
      },
      {
        label: 'R — Response',
        description: "Client's response to intervention",
      },
      {
        label: 'P — Plan',
        description: 'Next session focus, homework',
      },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-gray-900 font-semibold text-lg tracking-tight">
              SoloPractice
            </Link>
            <a
              href="/#waitlist"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white pt-16 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            Free Download — No Email Required
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Free Therapy Note Templates
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            SOAP, DAP, and BIRP templates in Google Doc format — structured fields, ready to copy
            to your Drive.
          </p>
        </div>
      </section>

      {/* Template Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.acronym}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col"
            >
              {/* Badge */}
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white font-bold text-sm">{template.acronym}</span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-5">{template.name}</h2>

              {/* Sections */}
              <ul className="space-y-4 flex-1 mb-8">
                {template.sections.map((section) => (
                  <li key={section.label}>
                    <p className="text-sm font-semibold text-indigo-600 mb-0.5">{section.label}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{section.description}</p>
                  </li>
                ))}
              </ul>

              <a
                href={template.docUrl}
                className="block w-full text-center bg-indigo-50 text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Copy Google Doc
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Soft CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-indigo-50 rounded-3xl p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
              These templates are the foundation.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              SoloPractice builds them into your workflow — so templates become structured,
              timestamped, locked notes that live in a HIPAA-compliant client record. No
              copy-pasting. No lost files. Every note signed and stored.
            </p>
            <a
              href="/#waitlist"
              className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors"
            >
              Join the waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
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
