'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Member } from '@/lib/types'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, UserCircle } from 'lucide-react'
import Link from 'next/link'

interface MembersContentProps {
  members: Member[]
  userId: string
}

export function MembersContent({ members, userId }: MembersContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  )

  const handleDelete = async (memberId: string) => {
    const supabase = createClient()
    await supabase.from('members').delete().eq('id', memberId)
    router.refresh()
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.4 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 relative z-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60">
            Members Directory
          </h1>
          <p className="text-black/60 mt-2 text-lg">Manage your members and their details</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 h-12 rounded-xl px-6">
          <Link href="/members/add">
            <Plus className="w-5 h-5" />
            Add Member
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-black/5 border-black/10 text-black placeholder:text-black/40 rounded-2xl focus-visible:ring-primary/50 transition-all backdrop-blur-md"
        />
      </motion.div>

      {/* Members Grid / List */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <UserCircle className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black/60 text-lg">
              {members.length === 0 
                ? 'No members yet. Add your first member to get started.'
                : 'No members found matching your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-black/10 hover:bg-transparent">
                  <TableHead className="text-black/60 font-medium py-5">Member Name</TableHead>
                  <TableHead className="text-black/60 font-medium">Date of Birth</TableHead>
                  <TableHead className="text-black/60 font-medium">Contact Info</TableHead>
                  <TableHead className="text-black/60 font-medium">Status</TableHead>
                  <TableHead className="text-right text-black/60 font-medium pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="border-black/5 hover:bg-black/5 transition-colors group">
                    <TableCell className="font-semibold text-black py-5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/30 flex items-center justify-center text-primary font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-black/70">
                      {new Date(member.date_of_birth).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-black/70 font-mono text-sm">{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant={member.marital_status === 'married' ? 'default' : 'secondary'} className={member.marital_status === 'married' ? 'bg-primary/20 text-primary border-primary/20 hover:bg-primary/30' : 'bg-black/10 text-black/70 hover:bg-black/20 border-black/5'}>
                        {member.marital_status === 'married' ? 'Married' : 'Single'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" asChild className="text-black/60 hover:text-black hover:bg-black/10 rounded-full">
                          <Link href={`/members/${member.id}/edit`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600/70 hover:text-red-600 hover:bg-red-600/10 rounded-full">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-black/10 text-black">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Member</AlertDialogTitle>
                              <AlertDialogDescription className="text-black/60">
                                Are you sure you want to delete <span className="text-black font-semibold">{member.name}</span>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-black/10 text-black hover:bg-black/5">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-red-500 hover:bg-red-600 text-white">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
