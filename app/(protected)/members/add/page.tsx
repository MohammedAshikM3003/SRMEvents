import { MemberForm } from '../member-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AddMemberPage() {
  const userId = '00000000-0000-0000-0000-000000000000'

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
            Add New Member
          </h1>
          <p className="text-black/60 mt-2 text-lg">Enter the details of the new member</p>
        </div>
      </div>

      <div className="mt-4">
        <MemberForm userId={userId} />
      </div>
    </div>
  )
}
