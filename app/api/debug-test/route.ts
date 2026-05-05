import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const userId = '105ea82f-76d3-4c88-b03d-e135e55d88b3'
  const testEmail = process.env.SMTP_EMAIL || 'test@example.com'

  const { error: contactError } = await supabase
    .from('notification_contacts')
    .upsert({
      user_id: userId,
      contact_type: 'email',
      contact_value: testEmail,
      is_active: true,
    }, { onConflict: 'user_id,contact_value' })

  if (contactError) return NextResponse.json({ error: contactError.message }, { status: 500 })

  const { error: settingsError } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      reminder_days_before: 3,
    }, { onConflict: 'user_id' })

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 })

  const targetDate = new Date()
  targetDate.setUTCDate(targetDate.getUTCDate() + 3)
  const dobStr = targetDate.toISOString().split('T')[0]

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      user_id: userId,
      name: 'Test Member (3 Days Ahead)',
      date_of_birth: dobStr,
      phone: '9999999999',
      marital_status: 'single',
      number_of_children: 0,
      has_insurance: false,
    })
    .select()
    .single()

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

  return NextResponse.json({
    message: 'Setup successful!',
    nextStep: 'Hit /api/cron/reminders'
  })
}
