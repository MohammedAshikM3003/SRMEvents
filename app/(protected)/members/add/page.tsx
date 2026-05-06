import { MemberForm } from '../member-form'
import { createClient } from '@/lib/supabase/server'

export default async function AddMemberPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  return (
    <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
      <MemberForm userId={userId} mode="add" />
    </div>
  )
}
