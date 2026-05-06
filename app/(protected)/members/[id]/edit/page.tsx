import { createClient } from '@/lib/supabase/server'
import { MemberForm } from '../../member-form'
import { notFound } from 'next/navigation'

interface EditMemberPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: { user } }, { data: member }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()
  ])

  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  if (!member) {
    notFound()
  }

  return (
    <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
      <MemberForm userId={userId} initialData={member} mode="edit" />
    </div>
  )
}
