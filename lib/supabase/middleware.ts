import { NextResponse, type NextRequest } from 'next/server'

export function updateSession(request: NextRequest) {
  // We are bypassing Supabase auth and using hardcoded login logic.
  // In a real app, you'd check a cookie or JWT here.
  // For now, we allow access to all pages to ensure the hardcoded login works.
  
  return NextResponse.next({
    request,
  })
}
