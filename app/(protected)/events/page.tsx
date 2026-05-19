import { createClient } from '@/lib/supabase/server'
import { EventsContent } from './events-content'

export default async function EventsPage() {
  const supabase = await createClient()
  
  // Get current user if available, fallback to placeholder for bypass
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)

  const memberIds = members?.map(m => m.id) || []
  
  const { data: acknowledgments } = await supabase
    .from('reminder_acknowledgments')
    .select('*')
    .in('member_id', memberIds)

  return <EventsContent members={members || []} acknowledgments={acknowledgments || []} />
}
