import { createClient } from '@/lib/supabase/server'
import { MembersContent } from './members-content'

export default async function MembersPage() {
  const supabase = await createClient()
  
  // Using a hardcoded user ID for bypass
  const userId = '00000000-0000-0000-0000-000000000000'

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  return <MembersContent members={members || []} userId={userId} />
}
