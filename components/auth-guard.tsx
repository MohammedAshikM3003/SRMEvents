'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      router.push('/auth/login')
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  if (!isAuthorized) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
