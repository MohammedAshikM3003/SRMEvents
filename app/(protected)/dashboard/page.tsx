import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user if available, fallback to placeholder for bypass
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  // Fetch members and settings in parallel
  const [membersResponse, settingsResponse] = await Promise.all([
    supabase
      .from('members')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()
  ])

  const members = membersResponse.data
  const settings = settingsResponse.data
  const reminderDays = settings?.reminder_days_before ?? 7

  return <DashboardContent members={members || []} reminderDays={reminderDays} />
}
