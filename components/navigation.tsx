'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Hexagon } from 'lucide-react'
import { useTranslation } from '@/components/language-provider'

export function Navigation() {
  const { t, language } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/members', label: t('members'), icon: Users },
    { href: '/events', label: t('events'), icon: Calendar },
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  const handleLogout = async () => {
    localStorage.removeItem('isLoggedIn')
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden glass-panel border-b border-black/10 relative z-50 bg-white/40 backdrop-blur-xl">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Hexagon className="w-5 h-5 text-primary fill-primary/20" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-black tracking-tighter">SRM</span>
              <span className="text-base font-bold text-black/70 tracking-tight">
                {language === 'en' ? 'LifeStyle' : 'லைஃப்ஸ்டைல்'}
              </span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 text-black/70 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <nav className="flex items-center gap-1 px-3 pb-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-black/5 border border-black/10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={cn("relative z-10 flex items-center gap-1.5", isActive ? "text-black font-bold" : "text-black/60 hover:text-black/90")}>
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 h-screen sticky top-0 p-6 z-40">
        <div 
          className="glass-panel flex-1 rounded-[2rem] p-6 flex flex-col h-full border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Subtle glow effect behind sidebar */}
          <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Centered Branding Section */}
          <div className="mb-12 px-2 pt-4 relative z-10 flex flex-col items-center text-center">
            <Link href="/dashboard" className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-110 mb-4 shrink-0">
                <Hexagon className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-black tracking-tighter leading-none mb-1">SRM</span>
                <span className="text-xl font-bold text-black/70 tracking-tight leading-none">
                  {language === 'en' ? 'LifeStyle' : 'லைஃப்ஸ்டைல்'}
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 flex flex-col gap-3 relative z-10">
            {navItems.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group overflow-hidden',
                    isActive ? 'text-black font-bold' : 'text-black/60 hover:text-black hover:bg-black/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent border-l-2 border-primary"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
                    />
                  )}

                  <item.icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300", isActive ? "text-primary" : "group-hover:scale-110")} />
                  <span className="relative z-10 text-base">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 relative z-10">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-black/60 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-2xl px-4 py-6 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              <span className="text-base font-medium">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
