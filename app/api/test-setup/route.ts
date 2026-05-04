import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // 1. Add Test Member
  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      user_id: user.id,
      name: 'Test Member (Tomorrow Event)',
      date_of_birth: tomorrowStr,
      phone: '1234567890',
      marital_status: 'single',
      number_of_children: 0,
      has_insurance: false,
    })
    .select()
    .single()

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // 2. Set Reminder Days to 1
  const { error: settingsError } = await supabase
    .from('settings')
    .upsert({
      user_id: user.id,
      reminder_days_before: 1,
    })

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 })
  }

  return NextResponse.json({ 
    message: 'Test setup complete!',
    member,
    reminder_days: 1,
    instructions: 'Now hit /api/cron/reminders to trigger the reminder email.'
  })
}
