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
import { Search, Plus, Edit2, Trash2, UserCircle, Phone, MoreVertical, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useTranslation } from '@/components/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MembersContentProps {
  members: Member[]
  userId: string
}

export function MembersContent({ members, userId }: MembersContentProps) {
  const { t } = useTranslation()
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

  const MemberActions = ({ member }: { member: Member }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5">
          <MoreVertical className="w-4 h-4 text-black/40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border-black/5 shadow-xl">
        <DropdownMenuItem asChild>
          <Link href={`/members/${member.id}/edit`} className="flex items-center gap-2 cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
            {t('edit')}
          </Link>
        </DropdownMenuItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />
              {t('delete')}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-black/10 text-black rounded-[2rem] p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">{t('delete_member')}</AlertDialogTitle>
              <AlertDialogDescription className="text-black/60 text-lg">
                {t('delete_confirmation', { name: member.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="bg-black/5 border-none text-black hover:bg-black/10 h-12 px-6 rounded-xl">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-red-600 hover:bg-red-700 text-white border-none h-12 px-6 rounded-xl">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )

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
            {t('members_directory')}
          </h1>
          <p className="text-black/60 mt-2 text-lg">{t('manage_members')}</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 h-12 rounded-xl px-6 shrink-0">
          <Link href="/members/add">
            <Plus className="w-5 h-5" />
            {t('add_member')}
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-white/50 backdrop-blur-md border-black/5 text-black placeholder:text-black/40 rounded-2xl focus-visible:ring-primary/50 transition-all shadow-sm"
        />
      </motion.div>

      {/* Desktop Table View */}
      <motion.div variants={itemVariants} className="hidden md:block glass-card overflow-hidden border-black/5 shadow-xl shadow-black/5">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <UserCircle className="w-10 h-10 text-black/20" />
            </div>
            <p className="text-black/60 text-lg">
              {members.length === 0 ? t('no_members') : t('no_results')}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-black/[0.03]">
              <TableRow className="border-black/10 hover:bg-transparent">
                <TableHead className="w-[80px] text-black font-bold py-5 pl-6 text-center">{t('sno')}</TableHead>
                <TableHead className="text-black font-bold py-5">{t('member_name')}</TableHead>
                <TableHead className="text-black font-bold">{t('date_of_birth')}</TableHead>
                <TableHead className="text-black font-bold">{t('contact_info')}</TableHead>
                <TableHead className="text-black font-bold text-center">{t('status')}</TableHead>
                <TableHead className="text-right text-black font-bold pr-6 w-[80px]">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member, index) => (
                <TableRow key={member.id} className="border-black/5 hover:bg-black/[0.01] transition-colors">
                  <TableCell className="font-medium text-black/40 pl-6 py-5 text-center">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/10">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-black text-base truncate max-w-[200px]">
                        {member.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-black/70 font-medium">
                    {formatDate(member.date_of_birth)}
                  </TableCell>
                  <TableCell>
                    <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-black/60 hover:text-primary transition-colors group/tel font-mono text-sm">
                        <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center shrink-0 group-hover/tel:bg-primary/10">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        {member.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={member.marital_status === 'married' ? 'default' : 'secondary'} 
                      className={member.marital_status === 'married' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-black/5 text-black/70 border-black/5'}
                    >
                      {member.marital_status === 'married' ? t('married') : t('single')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <MemberActions member={member} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Mobile Card View */}
      <motion.div variants={itemVariants} className="md:hidden flex flex-col gap-4">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-xl">
             <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle className="w-8 h-8 text-black/20" />
             </div>
             <p className="text-black/40 font-medium">{t('no_results')}</p>
          </div>
        ) : (
          filteredMembers.map((member, index) => (
            <div key={member.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-xl shadow-black/[0.02] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/10 to-purple-500/10 flex items-center justify-center text-primary font-bold border border-primary/5">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-lg leading-none">{member.name}</h3>
                    <p className="text-black/40 text-xs mt-1 font-medium">#{index + 1} Member</p>
                  </div>
                </div>
                <MemberActions member={member} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{t('date_of_birth')}</p>
                   <p className="text-sm font-semibold text-black/70">{formatDate(member.date_of_birth)}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{t('status')}</p>
                   <Badge 
                      variant={member.marital_status === 'married' ? 'default' : 'secondary'} 
                      className={member.marital_status === 'married' 
                        ? 'bg-primary/10 text-primary border-primary/10 text-[10px]' 
                        : 'bg-black/5 text-black/50 border-black/5 text-[10px]'}
                    >
                      {member.marital_status === 'married' ? t('married') : t('single')}
                    </Badge>
                </div>
                <div className="col-span-2 pt-4 border-t border-black/5">
                   <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">{t('contact_info')}</p>
                   <a href={`tel:${member.phone}`} className="flex items-center gap-3 text-black/60 hover:text-primary transition-colors font-mono font-medium">
                      <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center">
                         <Phone className="w-4 h-4" />
                      </div>
                      {member.phone}
                   </a>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
