'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Hexagon } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/members', label: 'Members', icon: Users },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    localStorage.removeItem('isLoggedIn')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden glass-panel border-b border-black/10 sticky top-0 z-50 bg-white/40 backdrop-blur-xl">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-primary fill-primary/20" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70">SRM LifeStyle</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-black/70 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <nav className="flex items-center gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-black/5 border border-black/10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.05)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={cn("relative z-10 flex items-center gap-2", isActive ? "text-black font-bold" : "text-black/60 hover:text-black/90")}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 p-6 z-40">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-panel flex-1 rounded-[2rem] p-6 flex flex-col h-full border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Subtle glow effect behind sidebar */}
          <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="mb-12 px-2 pt-2 relative z-10">
            <Link href="/dashboard" className="text-2xl font-extrabold text-black tracking-tight flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70">SRM LifeStyle</span>
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
              <span className="text-base font-medium">Logout</span>
            </Button>
          </div>
        </motion.div>
      </aside>
    </>
  )
}
