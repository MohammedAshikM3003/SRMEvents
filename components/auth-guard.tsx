'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const isLoggedIn = document.cookie.split('; ').find(row => row.startsWith('isLoggedIn='))?.split('=')[1]
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
