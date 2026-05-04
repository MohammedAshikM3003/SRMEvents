'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Hexagon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (username.trim() === 'SRMdgl' && password === 'SRMdgl') {
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/dashboard')
    } else {
      setError('Invalid username or password')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden p-6 md:p-10 bg-slate-50">
      
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
              <Hexagon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              SRM LifeStyle
            </h1>
            <p className="text-slate-500 font-medium">Event Reminder System</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="glass-card p-8 sm:p-10 border-white shadow-xl shadow-black/[0.03]"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">
                Access your member events and alerts
              </p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-slate-700 font-semibold ml-1">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="SRMdgl"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="SRMdgl"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center mt-1">
                  Use <span className="font-mono bg-slate-100 px-1 rounded">SRMdgl</span> / <span className="font-mono bg-slate-100 px-1 rounded">SRMdgl</span> to bypass
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-lg text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-base mt-2 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
