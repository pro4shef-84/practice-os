import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/ui/SidebarNav'

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch therapist name for sidebar
  const { data: therapist } = await supabase
    .from('therapists')
    .select('full_name, practice_name')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNav
        therapistName={therapist?.full_name ?? ''}
        practiceName={therapist?.practice_name ?? 'Practice OS'}
      />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
