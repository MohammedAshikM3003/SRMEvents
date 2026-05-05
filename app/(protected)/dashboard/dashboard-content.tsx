'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Member, UpcomingEvent } from '@/lib/types'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, BellRing, Sparkles } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface DashboardContentProps {
  members: Member[]
  reminderDays: number
}

function getUpcomingEvents(members: Member[], daysAhead: number): UpcomingEvent[] {
  const events: UpcomingEvent[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  members.forEach((member) => {
    // Birthday
    if (member.date_of_birth) {
      const dob = new Date(member.date_of_birth)
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
      
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= daysAhead) {
        events.push({
          id: `${member.id}-birthday`,
          memberId: member.id,
          memberName: member.name,
          eventType: 'birthday',
          eventDate: thisYearBirthday,
          daysUntil,
          phone: member.phone,
        })
      }
    }

    // Anniversary
    if (member.marital_status === 'married' && member.marriage_date) {
      const anniversary = new Date(member.marriage_date)
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())
      
      if (thisYearAnniversary < today) {
        thisYearAnniversary.setFullYear(today.getFullYear() + 1)
      }
      
      const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= daysAhead) {
        events.push({
          id: `${member.id}-anniversary`,
          memberId: member.id,
          memberName: member.name,
          eventType: 'anniversary',
          eventDate: thisYearAnniversary,
          daysUntil,
          phone: member.phone,
        })
      }
    }

    // Children birthdays
    const children = [
      { name: member.child1_name, dob: member.child1_dob },
      { name: member.child2_name, dob: member.child2_dob },
      { name: member.child3_name, dob: member.child3_dob },
    ]

    children.forEach((child, index) => {
      if (child.name && child.dob) {
        const childDob = new Date(child.dob)
        const thisYearBirthday = new Date(today.getFullYear(), childDob.getMonth(), childDob.getDate())
        
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }
        
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntil <= daysAhead) {
          events.push({
            id: `${member.id}-child-${index}`,
            memberId: member.id,
            memberName: member.name,
            eventType: 'child_birthday',
            eventDate: thisYearBirthday,
            daysUntil,
            childName: child.name,
            phone: member.phone,
          })
        }
      }
    })
  })

  return events.sort((a, b) => a.daysUntil - b.daysUntil)
}

function getEventBadgeVariant(daysUntil: number): 'destructive' | 'default' | 'secondary' {
  if (daysUntil === 0) return 'destructive'
  if (daysUntil <= 3) return 'default'
  return 'secondary'
}

function getEventTypeLabel(type: UpcomingEvent['eventType']): string {
  switch (type) {
    case 'birthday': return 'Birthday / பிறந்தநாள்'
    case 'anniversary': return 'Anniversary / திருமண நாள்'
    case 'child_birthday': return 'Child Birthday / குழந்தை பிறந்தநாள்'
  }
}

export function DashboardContent({ members, reminderDays }: DashboardContentProps) {
  const upcomingEvents = useMemo(() => getUpcomingEvents(members, reminderDays), [members, reminderDays])
  
  const todayEvents = upcomingEvents.filter(e => e.daysUntil === 0)
  const upcomingThisWeek = upcomingEvents.filter(e => e.daysUntil > 0 && e.daysUntil <= 7)
  const upcomingLater = upcomingEvents.filter(e => e.daysUntil > 7)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
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
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-extrabold text-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60">
          Dashboard
        </h1>
        <p className="text-black/60 mt-2 text-lg">
          Upcoming events in the next {reminderDays} days
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-4">
        {[
          { title: "Total Members", value: members.length, icon: Users, color: "from-blue-500 to-cyan-400" },
          { title: "Today's Events", value: todayEvents.length, icon: BellRing, color: "from-red-500 to-rose-400" },
          { title: "This Week", value: upcomingThisWeek.length, icon: Calendar, color: "from-violet-500 to-purple-400" },
          { title: "Upcoming", value: upcomingLater.length, icon: Sparkles, color: "from-emerald-500 to-indigo-400" }
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="glass-card relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-black/70 font-medium">{stat.title}</p>
                <div className={`p-2 rounded-xl bg-black/5`}>
                  <stat.icon className="w-5 h-5 text-black/80" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-black tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card border-red-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          <div className="p-6 relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600">Today&apos;s Events</h2>
                <p className="text-red-600/70 text-sm">இன்றைய நிகழ்வுகள்</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {todayEvents.map((event, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={event.id} 
                  className="flex items-center justify-between p-5 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <div>
                    <p className="text-lg font-bold text-black">
                      {event.eventType === 'child_birthday' 
                        ? `${event.childName} (${event.memberName}&apos;s child)`
                        : event.memberName}
                    </p>
                    <p className="text-sm font-medium text-red-700 mt-1">{getEventTypeLabel(event.eventType)}</p>
                    <p className="text-sm text-black/60 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      Phone: {event.phone}
                    </p>
                  </div>
                  <Badge variant="destructive" className="px-4 py-1.5 text-sm font-bold shadow-lg shadow-red-500/20">TODAY</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Events */}
      <motion.div variants={itemVariants} className="glass-card">
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">Upcoming Events</h2>
              <p className="text-black/60 text-sm">வரவிருக்கும் நிகழ்வுகள் ({reminderDays} days)</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {upcomingEvents.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-black/20" />
              </div>
              <p className="text-black/60 text-lg">No upcoming events in the next {reminderDays} days</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[...upcomingThisWeek, ...upcomingLater].map((event, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  key={event.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-black/5 border border-black/5 hover:bg-black/10 hover:border-black/10 hover:shadow-lg transition-all"
                >
                  <div className="mb-4 sm:mb-0">
                    <p className="text-lg font-bold text-black group-hover:text-primary transition-colors">
                      {event.eventType === 'child_birthday' 
                        ? `${event.childName} (${event.memberName}&apos;s child)`
                        : event.memberName}
                    </p>
                    <p className="text-sm font-medium text-black/70 mt-1">{getEventTypeLabel(event.eventType)}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-sm text-black/50 bg-white/20 px-3 py-1 rounded-full">
                        {formatDate(event.eventDate)}
                      </p>
                      <p className="text-sm text-black/50 bg-white/20 px-3 py-1 rounded-full">
                        {event.phone}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={getEventBadgeVariant(event.daysUntil)} 
                    className={`px-4 py-1.5 text-sm font-semibold whitespace-nowrap w-fit ${
                      event.daysUntil === 1 ? 'bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20' : 'bg-black/10 text-black/80 hover:bg-black/20 border-none'
                    }`}
                  >
                    {event.daysUntil === 1 ? 'Tomorrow' : `In ${event.daysUntil} days`}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
