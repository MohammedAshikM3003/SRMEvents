import { createClient } from '@/lib/supabase/server'
import { MemberForm } from '../../member-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

interface EditMemberPageProps {
  params: {
    id: string
  }
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || '105ea82f-76d3-4c88-b03d-e135e55d88b3'

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (!member) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8 relative z-10 max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/members">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60">
            Edit Member
          </h1>
          <p className="text-black/60 mt-2 text-lg">Update the details of {member.name}</p>
        </div>
      </div>

      <div className="mt-4">
        <MemberForm userId={userId} initialData={member} />
      </div>
    </div>
  )
}
