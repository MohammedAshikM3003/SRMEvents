import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Using a hardcoded user ID for bypass
  const userId = '00000000-0000-0000-0000-000000000000'

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
