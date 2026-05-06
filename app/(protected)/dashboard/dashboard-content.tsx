'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Member, UpcomingEvent } from '@/lib/types'
import { motion, Variants } from 'framer-motion'
import { Calendar, Users, Bell, Sparkles, CalendarDays } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { useTranslation } from '@/components/language-provider'

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

function getThisMonthEventsCount(members: Member[]): number {
  const today = new Date()
  const currentMonth = today.getMonth()
  let count = 0

  members.forEach(member => {
    const datesToCheck = [
      member.date_of_birth,
      member.marriage_date,
      member.child1_dob,
      member.child2_dob,
      member.child3_dob
    ]

    datesToCheck.forEach(dateStr => {
      if (dateStr) {
        const date = new Date(dateStr)
        if (date.getMonth() === currentMonth) {
          count++
        }
      }
    })
  })

  return count
}

function getEventBadgeVariant(daysUntil: number): 'destructive' | 'default' | 'secondary' {
  if (daysUntil === 0) return 'destructive'
  if (daysUntil <= 3) return 'default'
  return 'secondary'
}

export function DashboardContent({ members, reminderDays }: DashboardContentProps) {
  const { t, language } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const upcomingEvents = useMemo(() => {
    if (!mounted) return []
    return getUpcomingEvents(members, reminderDays)
  }, [members, reminderDays, mounted])

  const thisMonthEventsCount = useMemo(() => {
    return getThisMonthEventsCount(members)
  }, [members])

  const todayEvents = upcomingEvents.filter(e => e.daysUntil === 0)
  const upcomingThisWeek = upcomingEvents.filter(e => e.daysUntil > 0 && e.daysUntil <= 7)

  const getEventTypeLabel = (type: UpcomingEvent['eventType']): string => {
    switch (type) {
      case 'birthday': return t('birthday')
      case 'anniversary': return t('anniversary')
      case 'child_birthday': return t('child_birthday')
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.4 } }
  }

  const stats = [
    {
      title: 'TOTAL MEMBERS',
      subtitle: 'மொத்த உறுப்பினர்கள்',
      value: members.length,
      icon: Users,
      color: "from-blue-600 to-indigo-500",
      shadow: "shadow-blue-500/20"
    },
    {
      title: 'TODAY EVENTS',
      subtitle: 'இன்றைய நிகழ்வுகள்',
      value: todayEvents.length,
      icon: Bell,
      color: "from-rose-600 to-pink-500",
      shadow: "shadow-rose-500/20"
    },
    {
      title: 'THIS WEEK',
      subtitle: 'இந்த வாரம்',
      value: upcomingThisWeek.length,
      icon: Calendar,
      color: "from-amber-600 to-orange-500",
      shadow: "shadow-amber-500/20"
    },
    {
      title: 'THIS MONTH EVENTS',
      subtitle: 'இந்த மாத நிகழ்வுகள்',
      value: thisMonthEventsCount,
      icon: CalendarDays,
      color: "from-emerald-600 to-teal-500",
      shadow: "shadow-emerald-500/20"
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 relative z-10"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black text-black tracking-tighter">
          {t('dashboard')}
        </h1>
        <p className="text-black/50 mt-2 text-lg font-medium">
          Welcome back to your event control center
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
              "glass-card relative overflow-hidden group border-none p-6 shadow-2xl transition-all duration-300",
              stat.shadow
            )}
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl group-hover:opacity-20 transition-opacity",
              stat.color
            )} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg",
                  stat.color
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-black/40 tracking-widest leading-none mb-1">{stat.title}</p>
                  <p className="text-[11px] font-bold text-black/30 leading-none">{stat.subtitle}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-black tracking-tighter">{stat.value}</h3>
                <span className="text-sm font-bold text-black/40">Total</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Priority Events */}
      {todayEvents.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card border-none bg-white shadow-2xl shadow-rose-500/5 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tight">{t('today').toUpperCase()} EVENTS</h2>
                  <p className="text-rose-600 font-bold text-sm tracking-wide">இன்றைய நிகழ்வுகள்</p>
                </div>
              </div>
              <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20">
                Action Required
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {todayEvents.map((event, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={event.id}
                  className="flex items-center justify-between p-5 rounded-[1.5rem] bg-rose-500/[0.03] border border-rose-500/10 hover:bg-rose-500/[0.06] transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-black truncate leading-tight">
                      {event.eventType === 'child_birthday'
                        ? event.childName
                        : event.memberName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-rose-600/80 uppercase tracking-widest">
                        {getEventTypeLabel(event.eventType)}
                      </span>
                      {event.eventType === 'child_birthday' && (
                        <span className="text-[10px] font-bold text-black/30 truncate">({event.memberName}'s child)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a href={`tel:${event.phone}`} className="w-10 h-10 rounded-xl bg-white border border-rose-500/10 flex items-center justify-center text-rose-600 shadow-sm hover:bg-rose-600 hover:text-white transition-all">
                      <Bell className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Upcoming Timeline Section */}
      <motion.div variants={itemVariants} className="glass-card border-none bg-white shadow-2xl shadow-black/5 overflow-hidden">
        <div className="p-8 border-b border-black/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight uppercase">{t('upcoming_events')}</h2>
                <p className="text-primary font-bold text-sm tracking-wide">வரவிருக்கும் நிகழ்வுகள்</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          {upcomingEvents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-black/[0.02] flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-black/10" />
              </div>
              <p className="text-black/40 text-lg font-bold">{t('no_upcoming_events', { days: reminderDays })}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  key={event.id}
                  className="group flex flex-col p-6 rounded-[2rem] bg-black/[0.02] border border-black/[0.03] hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-black/5 text-black/60 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                    <span className="text-[10px] font-black text-black/20 uppercase">{formatDate(event.eventDate)}</span>
                  </div>

                  <p className="text-lg font-black text-black group-hover:text-primary transition-colors truncate mb-1">
                    {event.eventType === 'child_birthday'
                      ? event.childName
                      : event.memberName}
                  </p>

                  {event.eventType === 'child_birthday' && (
                    <p className="text-[10px] font-bold text-black/30 mb-4 truncate italic">Child of {event.memberName}</p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-black/[0.03]">
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-xl font-black tracking-tighter",
                        event.daysUntil <= 3 ? "text-orange-500" : "text-black/40"
                      )}>{event.daysUntil}</span>
                      <span className="text-[10px] font-bold text-black/30 uppercase">Days Left</span>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${event.phone}`} className="p-2 rounded-xl bg-black/[0.03] text-black/40 hover:bg-primary hover:text-white transition-all">
                        <Bell className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
