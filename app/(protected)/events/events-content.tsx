'use client'

import { useState, useMemo } from 'react'
import { Member, UpcomingEvent } from '@/lib/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, Variants } from 'framer-motion'
import { Search, Calendar, Cake, Heart, Baby, Phone, Bell, Edit2, Trash2, MoreVertical, CalendarDays, Sparkles } from 'lucide-react'
import { format, differenceInDays, addYears, startOfDay, setYear } from 'date-fns'
import { cn, formatDate } from '@/lib/utils'
import { useTranslation } from '@/components/language-provider'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EventsContentProps {
  members: Member[]
}

export function EventsContent({ members }: EventsContentProps) {
  const { t, language } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const upcomingEvents = useMemo(() => {
    const events: UpcomingEvent[] = []
    const today = startOfDay(new Date())

    members.forEach(member => {
      const checkEvent = (dateStr: string | null, type: UpcomingEvent['eventType'], childName?: string) => {
        if (!dateStr) return

        const eventDate = new Date(dateStr)
        let nextEvent = setYear(eventDate, today.getFullYear())
        nextEvent = startOfDay(nextEvent)

        if (nextEvent < today) {
          nextEvent = addYears(nextEvent, 1)
        }

        const daysUntil = differenceInDays(nextEvent, today)

        events.push({
          id: `${member.id}-${type}-${childName || ''}`,
          memberId: member.id,
          memberName: member.name,
          eventType: type,
          eventDate: nextEvent,
          daysUntil,
          childName,
          phone: member.phone
        })
      }

      // Member Birthday
      checkEvent(member.date_of_birth, 'birthday')

      // Marriage Anniversary
      if (member.marital_status === 'married') {
        checkEvent(member.marriage_date, 'anniversary')
      }

      // Children Birthdays
      if (member.number_of_children >= 1) checkEvent(member.child1_dob, 'child_birthday', member.child1_name || 'Child 1')
      if (member.number_of_children >= 2) checkEvent(member.child2_dob, 'child_birthday', member.child2_name || 'Child 2')
      if (member.number_of_children >= 3) checkEvent(member.child3_dob, 'child_birthday', member.child3_name || 'Child 3')
    })

    return events.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [members])

  const filteredEvents = upcomingEvents.filter(event => 
    event.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.childName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    event.eventType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getEventIcon = (type: UpcomingEvent['eventType']) => {
    switch (type) {
      case 'birthday': return <Cake className="w-4 h-4 text-pink-500" />
      case 'anniversary': return <Heart className="w-4 h-4 text-red-500" />
      case 'child_birthday': return <Baby className="w-4 h-4 text-blue-500" />
      default: return <Calendar className="w-4 h-4 text-slate-500" />
    }
  }

  const getEventLabel = (event: UpcomingEvent) => {
    switch (event.eventType) {
      case 'birthday': return t('birthday')
      case 'anniversary': return t('anniversary')
      case 'child_birthday': return t('birthday_child', { name: event.childName || '' })
      default: return 'Event'
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.4 } }
  }

  const EventActions = ({ event }: { event: UpcomingEvent }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5">
          <MoreVertical className="w-4 h-4 text-black/40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border-black/5 shadow-xl">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50">
          <Bell className="w-3.5 h-3.5" />
          {t('notify')}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/members/${event.memberId}/edit`} className="flex items-center gap-2 cursor-pointer">
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
              <AlertDialogTitle className="text-2xl font-bold">{language === 'en' ? 'Delete Event' : 'நிகழ்வை நீக்கு'}</AlertDialogTitle>
              <AlertDialogDescription className="text-black/60 text-lg">
                {t('delete_confirmation', { name: event.memberName + "'s " + getEventLabel(event) })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="bg-black/5 border-none text-black hover:bg-black/10 h-12 px-6 rounded-xl">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white border-none h-12 px-6 rounded-xl">
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
            {t('upcoming_events_title')}
          </h1>
          <p className="text-black/60 mt-2 text-lg">{t('track_events')}</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative group max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-black/30 group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          placeholder={t('search_events_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-white/50 backdrop-blur-md border-black/5 rounded-2xl text-black focus-visible:ring-primary/50 transition-all shadow-sm"
        />
      </motion.div>

      {/* Desktop Table View */}
      <motion.div variants={itemVariants} className="hidden md:block glass-card overflow-hidden border-black/5 shadow-xl shadow-black/5">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-black/[0.03]">
              <TableRow className="hover:bg-transparent border-black/10">
                <TableHead className="w-[80px] py-5 px-6 text-black font-bold text-center">{t('sno')}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold">{t('event_date')}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold">{t('member_name')}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold">{language === 'en' ? 'Event Type' : 'நிகழ்வு வகை'}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold">{t('countdown')}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold">{language === 'en' ? 'Contact' : 'தொடர்பு'}</TableHead>
                <TableHead className="py-5 px-6 text-black font-bold text-right w-[80px]">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-black/20" />
                      </div>
                      <p className="text-black/50 text-lg font-medium">{t('no_events_found')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event, index) => (
                  <TableRow key={event.id} className="hover:bg-black/[0.01] border-black/5 transition-colors">
                    <TableCell className="py-5 px-6 font-medium text-black/40 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="text-black font-bold text-base whitespace-nowrap">
                        {formatDate(event.eventDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="text-black font-semibold text-base">
                        {event.memberName}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                          {getEventIcon(event.eventType)}
                        </div>
                        <span className="text-black/70 font-medium whitespace-nowrap">
                          {getEventLabel(event)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      {event.daysUntil === 0 ? (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none px-4 py-1 rounded-full animate-pulse font-bold shadow-lg shadow-red-500/20">
                          {t('today')}!
                        </Badge>
                      ) : event.daysUntil === 1 ? (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-4 py-1 rounded-full font-bold shadow-lg shadow-orange-500/20">
                          {t('tomorrow')}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-base font-black",
                            event.daysUntil <= 7 ? "text-orange-600" : "text-black/60"
                          )}>
                            {event.daysUntil}
                          </span>
                          <span className="text-black/40 text-xs font-bold uppercase tracking-wider">{t('days_left')}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <a 
                        href={`tel:${event.phone}`}
                        className="flex items-center gap-2 text-black/60 hover:text-primary transition-colors group/tel"
                      >
                        <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center shrink-0 group-hover/tel:bg-primary/10 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono text-sm">{event.phone}</span>
                      </a>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-right">
                      <EventActions event={event} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <motion.div variants={itemVariants} className="md:hidden flex flex-col gap-4">
         {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-xl">
               <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-black/20" />
               </div>
               <p className="text-black/40 font-medium">{t('no_events_found')}</p>
            </div>
         ) : (
            filteredEvents.map((event, index) => (
               <div key={event.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-xl shadow-black/[0.02] relative overflow-hidden group">
                  <div className={cn(
                     "absolute top-0 left-0 w-1 h-full",
                     event.daysUntil === 0 ? "bg-red-500" : event.daysUntil <= 7 ? "bg-orange-500" : "bg-primary/20"
                  )} />
                  
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center text-primary font-bold border border-black/5 shrink-0">
                           {getEventIcon(event.eventType)}
                        </div>
                        <div>
                           <h3 className="font-bold text-black text-lg leading-tight truncate max-w-[200px]">{event.memberName}</h3>
                           <p className="text-black/40 text-[10px] mt-1 font-black uppercase tracking-widest">{getEventLabel(event)}</p>
                        </div>
                     </div>
                     <EventActions event={event} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{t('event_date')}</p>
                        <p className="text-sm font-semibold text-black/70">{formatDate(event.eventDate)}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">{t('countdown')}</p>
                        {event.daysUntil === 0 ? (
                           <span className="text-xs font-black text-red-600 animate-pulse">TODAY!</span>
                        ) : (
                           <div className="flex items-baseline gap-1">
                              <span className={cn(
                                 "text-sm font-black",
                                 event.daysUntil <= 7 ? "text-orange-600" : "text-black/60"
                              )}>{event.daysUntil}</span>
                              <span className="text-[10px] font-bold text-black/30">DAYS</span>
                           </div>
                        )}
                     </div>
                     <div className="col-span-2 pt-4 border-t border-black/5">
                        <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">{language === 'en' ? 'Contact' : 'தொடர்பு'}</p>
                        <a href={`tel:${event.phone}`} className="flex items-center gap-3 text-black/60 hover:text-primary transition-colors font-mono font-medium">
                           <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                           </div>
                           {event.phone}
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
