import { createClient } from '@supabase/supabase-js'
import * as nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'
import { formatDate } from '@/lib/utils'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Get all user settings
  const { data: allSettings, error: settingsError } = await supabase
    .from('settings')
    .select('*')

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 })
  }

  const currentHour = new Date().getUTCHours().toString().padStart(2, '0') + ':00'
  const results = []

  for (const settings of allSettings) {
    const userId = settings.user_id
    const daysAhead = settings.reminder_days_before || 7
    const preferredTime = settings.reminder_time || '09:00'

    if (preferredTime !== currentHour) {
      results.push({ userId, status: 'skipped_time', preferredTime, currentHour })
      continue
    }

    // 2. Get notification contacts for this user
    const { data: contacts, error: contactsError } = await supabase
      .from('notification_contacts')
      .select('contact_value')
      .eq('user_id', userId)
      .eq('contact_type', 'email')
      .eq('is_active', true)

    if (contactsError || !contacts || contacts.length === 0) continue

    // 3. Get members for this user
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)

    if (membersError || !members) continue

    // 4. Get existing acknowledgments for this year
    const currentYear = new Date().getUTCFullYear().toString()
    const { data: acknowledgments, error: ackError } = await supabase
      .from('reminder_acknowledgments')
      .select('*')
      .gte('event_date', `${currentYear}-01-01`)
      .lte('event_date', `${currentYear}-12-31`)

    if (ackError) continue

    const isAcknowledged = (memberId: string, type: string, month: number, day: number) => {
      const dateStr = `${currentYear}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      return acknowledgments?.some(ack => 
        ack.member_id === memberId && 
        ack.event_type === type && 
        ack.event_date === dateStr
      )
    }

    const upcomingEvents = []

    const parseDateUTC = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return { year, month: month - 1, day }
    }

    // Logic change: Check from 1 day ahead up to daysAhead
    for (let d = 1; d <= daysAhead; d++) {
      const today = new Date()
      const targetDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + d))
      const targetMonth = targetDate.getUTCMonth()
      const targetDay = targetDate.getUTCDate()
      const eventYearDate = `${targetDate.getUTCFullYear()}-${(targetMonth + 1).toString().padStart(2, '0')}-${targetDay.toString().padStart(2, '0')}`

      for (const member of members) {
        // Check Member Birthday
        if (member.date_of_birth) {
          const { month, day } = parseDateUTC(member.date_of_birth)
          if (month === targetMonth && day === targetDay) {
            if (!isAcknowledged(member.id, 'Birthday', month, day)) {
              upcomingEvents.push({ 
                memberId: member.id,
                name: member.name, 
                type: 'Birthday', 
                tamilType: 'பிறந்தநாள்',
                date: member.date_of_birth,
                eventYearDate,
                daysRemaining: d,
                branch: member.branch
              })
            }
          }
        }

        // Check Marriage Anniversary
        if (member.marital_status === 'married' && member.marriage_date) {
          const { month, day } = parseDateUTC(member.marriage_date)
          if (month === targetMonth && day === targetDay) {
            if (!isAcknowledged(member.id, 'Wedding Anniversary', month, day)) {
              upcomingEvents.push({ 
                memberId: member.id,
                name: member.name, 
                type: 'Wedding Anniversary', 
                tamilType: 'திருமண நாள்',
                date: member.marriage_date,
                eventYearDate,
                daysRemaining: d,
                branch: member.branch
              })
            }
          }
        }

        // Check Children Birthdays
        const children = [
          { name: member.child1_name, dob: member.child1_dob, label: 'child1' },
          { name: member.child2_name, dob: member.child2_dob, label: 'child2' },
          { name: member.child3_name, dob: member.child3_dob, label: 'child3' }
        ]

        children.forEach((child, index) => {
          if (child.dob && member.number_of_children > index) {
            const { month, day } = parseDateUTC(child.dob)
            if (month === targetMonth && day === targetDay) {
              const type = 'Child Birthday'
              if (!isAcknowledged(member.id, type, month, day)) {
                upcomingEvents.push({ 
                  memberId: member.id,
                  name: `${child.name} (${member.name}'s child)`, 
                  type, 
                  tamilType: `பிறந்தநாள் (${child.name})`,
                  date: child.dob,
                  eventYearDate,
                  daysRemaining: d,
                  branch: member.branch
                })
              }
            }
          }
        })
      }
    }

    if (upcomingEvents.length > 0) {
      const emailList = contacts.map(c => c.contact_value).join(', ')
      
      const getDoneLink = (event: any) => {
        return `${origin}/api/reminders/acknowledge?memberId=${event.memberId}&type=${encodeURIComponent(event.type)}&date=${event.eventYearDate}`
      }

      // Tamil Event List
      const tamilEventListHtml = upcomingEvents.map(event => 
        `<li style="margin-bottom: 15px;">
          <strong>${event.name}</strong> - ${event.tamilType} <br/>
          கிளை: ${event.branch || 'N/A'} | தேதி: ${formatDate(event.date)} (${event.daysRemaining} நாட்களில்) <br/>
          <a href="${getDoneLink(event)}" style="display: inline-block; margin-top: 5px; padding: 5px 10px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; font-size: 12px;">Done / முடிந்தது</a>
        </li>`
      ).join('')

      // English Event List
      const englishEventListHtml = upcomingEvents.map(event => 
        `<li style="margin-bottom: 15px;">
          <strong>${event.name}</strong> - ${event.type} <br/>
          Branch: ${event.branch || 'N/A'} | Date: ${formatDate(event.date)} (in ${event.daysRemaining} days) <br/>
          <a href="${getDoneLink(event)}" style="display: inline-block; margin-top: 5px; padding: 5px 10px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; font-size: 12px;">Mark as Done</a>
        </li>`
      ).join('')

      try {
        await transporter.sendMail({
          from: `"SRM Events" <${process.env.SMTP_EMAIL}>`,
          to: emailList,
          subject: `Upcoming Event Reminders (${upcomingEvents.length} events)`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              
              <!-- Tamil Section -->
              <div style="margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
                <h2 style="color: #6366f1; margin-top: 0;">நிகழ்வு நினைவூட்டல்கள்</h2>
                <ul style="color: #334155; line-height: 1.6; list-style-type: none; padding-left: 0;">
                  ${tamilEventListHtml}
                </ul>
              </div>

              <!-- English Section -->
              <div>
                <h2 style="color: #6366f1; margin-top: 0;">Event Reminders</h2>
                <ul style="color: #334155; line-height: 1.6; list-style-type: none; padding-left: 0;">
                  ${englishEventListHtml}
                </ul>
              </div>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                இது SRM LifeStyle Events-இின் தானியங்கி நினைவூட்டல் ஆகும். 'Done' பொத்தானை அழுத்தினால் அடுத்த நினைவூட்டல் வராது. <br/>
                This is an automated reminder. Click 'Done' to stop reminders for that event.
              </p>
            </div>
          `
        })
        results.push({ userId, status: 'success', eventsSent: upcomingEvents.length })
      } catch (error: any) {
        console.error(`Failed to send email for user ${userId}:`, error)
        results.push({ userId, status: 'failed', error: error.message })
      }
    } else {
      results.push({ userId, status: 'no_events' })
    }
  }

  return NextResponse.json({ results })
}
