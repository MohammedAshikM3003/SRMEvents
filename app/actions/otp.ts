'use server'

import { createClient } from '@/lib/supabase/server'
import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendOtp(contactType: 'email', contactValue: string, userId: string) {
  const supabase = await createClient()
  
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  // Save to database
  const { error: dbError } = await supabase
    .from('otp_verifications')
    .insert({
      user_id: userId,
      contact_type: contactType,
      contact_value: contactValue,
      otp,
      expires_at: expiresAt.toISOString(),
    })

  if (dbError) {
    console.error('Error saving OTP:', dbError)
    if (userId === '00000000-0000-0000-0000-000000000000' || userId === '105ea82f-76d3-4c88-b03d-e135e55d88b3') {
      return { 
        success: false, 
        error: 'Database error occurred during bypass. This can happen if the bypass User ID is invalid or missing from the users table. Please try signing in with a real account.' 
      }
    }
    return { success: false, error: 'Failed to generate OTP. Please try again.' }
  }

  // Send OTP
  try {
    if (contactType === 'email') {
      await transporter.sendMail({
        from: `"SRM Events" <${process.env.SMTP_EMAIL}>`,
        to: contactValue,
        subject: 'Your Verification Code',
        html: `<p>Your SRM LifeStyle Events verification code is: <strong>${otp}</strong></p>`
      })
    }
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Failed to send OTP. Check your API keys and try again.' }
  }
}

export async function verifyOtp(contactType: 'email', contactValue: string, otp: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_type', contactType)
    .eq('contact_value', contactValue)
    .eq('otp', otp)
    .eq('verified', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return { success: false, error: 'Invalid or expired OTP' }
  }

  // Mark as verified
  await supabase
    .from('otp_verifications')
    .update({ verified: true })
    .eq('id', data.id)

  // Insert into notification contacts (using upsert to avoid duplicate key errors)
  const { error: insertError } = await supabase
    .from('notification_contacts')
    .upsert({
      user_id: userId,
      contact_type: contactType,
      contact_value: contactValue,
      is_active: true,
    }, { onConflict: 'user_id,contact_value' })

  if (insertError) {
    console.error('Error inserting contact:', insertError)
    return { success: false, error: 'Failed to save contact' }
  }

  return { success: true }
}

export async function sendMasterVerification(userId: string) {
  const supabase = await createClient()
  const targetEmail = process.env.NEXT_PUBLIC_MASTER_EMAIL

  if (!targetEmail) {
    return { success: false, error: 'Master email not configured in environment.' }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Save a single verification record against the master email to represent the command center auth
  const { error: dbError } = await supabase
    .from('otp_verifications')
    .insert({
      user_id: userId,
      contact_type: 'email',
      contact_value: targetEmail,
      otp,
      expires_at: expiresAt.toISOString(),
    })

  if (dbError) {
    console.error('Error saving master OTP:', dbError)
    return { success: false, error: 'Failed to generate Master OTP.' }
  }

  try {
    await transporter.sendMail({
      from: `"Indigo Loom" <${process.env.SMTP_EMAIL}>`,
      to: targetEmail,
      subject: 'Command Center Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 40px; border-radius: 16px; color: white;">
          <h1 style="color: #818cf8; margin-bottom: 8px;">Indigo Loom</h1>
          <h2 style="color: white; margin-top: 0;">Command Center Authorization</h2>
          <p style="color: #cbd5e1; font-size: 16px;">A request to authorize the production bridge was initiated. Your verification code is:</p>
          <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">If you did not request this code, please ignore this email.</p>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending Master OTP:', error)
    return { success: false, error: 'Failed to dispatch Master OTPs.' }
  }
}

export async function verifyMasterOtp(otp: string, userId: string) {
  const supabase = await createClient()
  const targetEmail = process.env.NEXT_PUBLIC_MASTER_EMAIL

  const { data, error } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('contact_type', 'email')
    .eq('contact_value', targetEmail)
    .eq('otp', otp)
    .eq('verified', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return { success: false, error: 'Invalid or expired Master OTP' }
  }

  await supabase
    .from('otp_verifications')
    .update({ verified: true })
    .eq('id', data.id)

  return { success: true }
}

export async function sendMasterReminder(userId: string) {
  const supabase = await createClient()

  // Fetch all active email contacts for this user
  const { data: contacts, error: contactsError } = await supabase
    .from('notification_contacts')
    .select('contact_value')
    .eq('user_id', userId)
    .eq('contact_type', 'email')
    .eq('is_active', true)

  if (contactsError) {
    console.error('Error fetching contacts:', contactsError)
    return { success: false, error: 'Failed to fetch contacts.' }
  }

  if (!contacts || contacts.length === 0) {
    return { success: false, error: 'No active email contacts found to send reminders.' }
  }

  try {
    const emailsToSend = contacts.map(contact => ({
      from: `"Indigo Loom" <${process.env.SMTP_EMAIL}>`,
      to: contact.contact_value,
      subject: 'Event Reminder: Production Bridge Armed',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 40px; border-radius: 16px; color: white;">
          <div style="width: 48px; height: 48px; background: linear-gradient(to top right, #6366f1, #a855f7); border-radius: 12px; margin-bottom: 20px;"></div>
          <h1 style="color: #fff; margin-bottom: 8px;">Indigo Loom Mock Reminder</h1>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">This is a test event reminder triggered from the Command Center. The production bridge connecting your database, Next.js application, and Nodemailer is fully operational.</p>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 14px;">System Status: Verified & Armed</p>
        </div>
      `
    }))

    // Send emails in parallel
    await Promise.all(emailsToSend.map(email => transporter.sendMail(email)))

    return { success: true }
  } catch (error) {
    console.error('Error sending master reminder:', error)
    return { success: false, error: 'Failed to send mock reminders.' }
  }
}
