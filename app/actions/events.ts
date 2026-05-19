'use server'

import { createClient } from '@supabase/supabase-js'

export async function undoAcknowledgment(memberId: string, eventType: string, eventDate: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('reminder_acknowledgments')
      .delete()
      .eq('member_id', memberId)
      .eq('event_type', eventType)
      .eq('event_date', eventDate)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error undoing acknowledgment:', error)
    return { success: false, error: 'Failed to undo acknowledgment' }
  }
}
