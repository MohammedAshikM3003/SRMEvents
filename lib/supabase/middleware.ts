import { NextResponse, type NextRequest } from 'next/server'

export function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value

  // Protected routes: any route that is NOT /auth/login and NOT an API route (except cron/reminders)
  // Or more simply, if it starts with /dashboard, /members, /events, /settings
  const protectedRoutes = ['/dashboard', '/members', '/events', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && isLoggedIn !== 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (pathname === '/auth/login' && isLoggedIn === 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next({
    request,
  })
}
