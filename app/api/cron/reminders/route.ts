import { createClient } from '@/lib/supabase/server'
import * as nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function GET(request: Request) {
  // Check for authorization header if needed (e.g., cron secret)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For testing, we might skip this or use a query param
  }

  const supabase = await createClient()

  // 1. Get all user settings
  const { data: allSettings, error: settingsError } = await supabase
    .from('settings')
    .select('*')

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 })
  }

  const results = []

  for (const settings of allSettings) {
    const userId = settings.user_id
    const daysAhead = settings.reminder_days_before || 7

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysAhead)
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()

    const upcomingEvents = []

    for (const member of members) {
      // Check Member Birthday
      if (member.date_of_birth) {
        const dob = new Date(member.date_of_birth)
        if (dob.getMonth() === targetMonth && dob.getDate() === targetDay) {
          upcomingEvents.push({
            name: member.name,
            type: 'Birthday',
            date: dob,
          })
        }
      }

      // Check Marriage Anniversary
      if (member.marital_status === 'married' && member.marriage_date) {
        const dom = new Date(member.marriage_date)
        if (dom.getMonth() === targetMonth && dom.getDate() === targetDay) {
          upcomingEvents.push({
            name: member.name,
            type: 'Wedding Anniversary',
            date: dom,
          })
        }
      }

      // Check Children Birthdays
      if (member.number_of_children >= 1 && member.child1_dob) {
        const dob = new Date(member.child1_dob)
        if (dob.getMonth() === targetMonth && dob.getDate() === targetDay) {
          upcomingEvents.push({
            name: `${member.child1_name} (${member.name}'s child)`,
            type: 'Birthday',
            date: dob,
          })
        }
      }
      if (member.number_of_children >= 2 && member.child2_dob) {
        const dob = new Date(member.child2_dob)
        if (dob.getMonth() === targetMonth && dob.getDate() === targetDay) {
          upcomingEvents.push({
            name: `${member.child2_name} (${member.name}'s child)`,
            type: 'Birthday',
            date: dob,
          })
        }
      }
      if (member.number_of_children >= 3 && member.child3_dob) {
        const dob = new Date(member.child3_dob)
        if (dob.getMonth() === targetMonth && dob.getDate() === targetDay) {
          upcomingEvents.push({
            name: `${member.child3_name} (${member.name}'s child)`,
            type: 'Birthday',
            date: dob,
          })
        }
      }
    }

    if (upcomingEvents.length > 0) {
      // Send Email
      const emailList = contacts.map(c => c.contact_value).join(', ')
      const eventListHtml = upcomingEvents.map(event => 
        `<li><strong>${event.name}</strong> - ${event.type}</li>`
      ).join('')

      try {
        await transporter.sendMail({
          from: `"SRM Events" <${process.env.SMTP_EMAIL}>`,
          to: emailList,
          subject: `Upcoming Event Reminder: ${upcomingEvents.length} event(s) in ${daysAhead} days`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #1e293b;">Event Reminders</h2>
              <p>The following events are coming up in <strong>${daysAhead}</strong> day(s):</p>
              <ul style="color: #334155;">
                ${eventListHtml}
              </ul>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">This is an automated reminder from SRM LifeStyle Events.</p>
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
