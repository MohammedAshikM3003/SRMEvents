import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from './settings-content'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Using a hardcoded user ID for bypass
  const userId = '00000000-0000-0000-0000-000000000000'

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
