import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Practice OS — Practice Management for Solo Therapists',
  description:
    'Practice management built for one. Notes that auto-save, cancellation fees that enforce themselves, and no hidden transaction fees. $79/month flat.',
  openGraph: {
    title: 'Practice OS — Practice Management for Solo Therapists',
    description:
      'Practice management built for one. Notes that auto-save, cancellation fees that enforce themselves, and no hidden transaction fees. $79/month flat.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
