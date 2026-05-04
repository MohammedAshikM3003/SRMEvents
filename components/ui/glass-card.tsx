import React from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
