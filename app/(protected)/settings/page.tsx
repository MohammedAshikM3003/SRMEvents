import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Get current user if available, fallback to placeholder for bypass
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  // Fetch notification contacts and settings in parallel
  const [contactsResponse, settingsResponse] = await Promise.all([
    supabase
      .from('notification_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()
  ])

  const contacts = contactsResponse.data
  const settings = settingsResponse.data

  return (
    <SettingsContent 
      contacts={contacts || []} 
      settings={settings} 
      userId={userId} 
    />
  )
}
