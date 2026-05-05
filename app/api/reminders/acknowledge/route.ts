import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')
  const eventType = searchParams.get('type')
  const eventDate = searchParams.get('date') // The specific year's event date, e.g., 2026-05-06

  if (!memberId || !eventType || !eventDate) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase
    .from('reminder_acknowledgments')
    .insert({
      member_id: memberId,
      event_type: eventType,
      event_date: eventDate,
    })

  if (error) {
    console.error('Error acknowledging reminder:', error)
    return new NextResponse('Error acknowledging reminder', { status: 500 })
  }

  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reminder Acknowledged</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; }
          .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
          h1 { color: #6366f1; margin-bottom: 1rem; }
          p { color: #475569; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Thank You!</h1>
          <p>This event has been marked as acknowledged. You won't receive more reminders for this event this year.</p>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}
