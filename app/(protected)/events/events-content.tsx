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
import { motion } from 'framer-motion'
import { Search, Calendar, Cake, Heart, Baby, Phone } from 'lucide-react'
import { format, differenceInDays, addYears, startOfDay, setYear } from 'date-fns'
import { cn, formatDate } from '@/lib/utils'

interface EventsContentProps {
  members: Member[]
}

export function EventsContent({ members }: EventsContentProps) {
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
      case 'birthday': return 'Birthday'
      case 'anniversary': return 'Wedding Anniversary'
      case 'child_birthday': return `${event.childName}'s Birthday`
      default: return 'Event'
    }
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
            Upcoming Events
          </h1>
          <p className="text-black/60 mt-2 text-lg">Track birthdays and anniversaries across your members</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative group max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-black/30 group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          placeholder="Search member, event type or child name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-white/50 backdrop-blur-md border-black/5 rounded-2xl text-black focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader className="bg-black/5">
              <TableRow className="hover:bg-transparent border-black/5">
                <TableHead className="py-4 px-6 text-black font-bold">Event Date</TableHead>
                <TableHead className="py-4 px-6 text-black font-bold">Member Name</TableHead>
                <TableHead className="py-4 px-6 text-black font-bold">Event Type</TableHead>
                <TableHead className="py-4 px-6 text-black font-bold">Countdown</TableHead>
                <TableHead className="py-4 px-6 text-black font-bold">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-black/20" />
                      </div>
                      <p className="text-black/50 text-lg font-medium">No upcoming events found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-black/[0.02] border-black/5 transition-colors group">
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-black font-bold text-base">
                          {formatDate(event.eventDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="text-black font-medium text-base group-hover:text-primary transition-colors">
                        {event.memberName}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center transition-transform group-hover:scale-110">
                          {getEventIcon(event.eventType)}
                        </div>
                        <span className="text-black/70 font-medium">
                          {getEventLabel(event)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {event.daysUntil === 0 ? (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1 rounded-full animate-pulse">
                          Today!
                        </Badge>
                      ) : event.daysUntil === 1 ? (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 rounded-full">
                          Tomorrow
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-base font-bold",
                            event.daysUntil <= 7 ? "text-orange-600" : "text-black/60"
                          )}>
                            {event.daysUntil}
                          </span>
                          <span className="text-black/40 text-sm">days left</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <a 
                        href={`tel:${event.phone}`}
                        className="flex items-center gap-2 text-black/60 hover:text-primary transition-colors group/tel"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover/tel:bg-primary/10 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="font-mono">{event.phone}</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  )
}
