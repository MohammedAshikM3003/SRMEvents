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

  // Check if already exists to prevent duplicate error
  const { data: existing } = await supabase
    .from('reminder_acknowledgments')
    .select('id')
    .eq('member_id', memberId)
    .eq('event_type', eventType)
    .eq('event_date', eventDate)
    .single()

  if (!existing) {
    const { error } = await supabase
      .from('reminder_acknowledgments')
      .insert({
        member_id: memberId,
        event_type: eventType,
        event_date: eventDate,
      })

    if (error) {
      console.error('Error acknowledging reminder:', error)
      // Return custom styled error page instead of raw text
      return new NextResponse(renderPage(false, error.message), {
        headers: { 'Content-Type': 'text/html' },
        status: 500
      })
    }
  }

  return new NextResponse(renderPage(true), {
    headers: { 'Content-Type': 'text/html' }
  })
}

function renderPage(success: boolean, error?: string) {
  const title = success ? 'Done / முடிந்தது' : 'Error / பிழை'
  const message = success 
    ? "This event has been marked as acknowledged. You won't receive more reminders for this event this year." 
    : `Something went wrong: ${error}. Please try again later.`
  const tamilMessage = success
    ? "இந்த நிகழ்வு முடிந்தது என குறிக்கப்பட்டுள்ளது. இந்த ஆண்டிற்கான கூடுதல் நினைவூட்டல்கள் வராது."
    : "ஏதோ தவறு நடந்துவிட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்."

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - SRM Events</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            background-image: 
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          }
        </style>
      </head>
      <body>
        <div class="glass-card max-w-md w-full rounded-[2rem] p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
          <div class="mb-8 flex justify-center">
            ${success 
              ? `<div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>`
              : `<div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>`
            }
          </div>
          
          <h1 class="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">${title}</h1>
          <p class="text-slate-600 text-lg mb-6 leading-relaxed">${message}</p>
          
          <div class="h-px bg-slate-200 w-full mb-6"></div>
          
          <p class="text-slate-500 text-sm font-medium italic mb-2">${tamilMessage}</p>
          
          <div class="mt-8">
            <a href="/" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
              Go to Dashboard
            </a>
          </div>

          <p class="mt-8 text-xs text-slate-400">SRM LifeStyle Events - System Notification</p>
        </div>
      </body>
    </html>
  `
}
