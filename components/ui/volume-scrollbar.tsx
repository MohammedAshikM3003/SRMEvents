'use client'

import React, { useEffect, useRef, useState } from 'react'

interface VolumeScrollbarProps {
  children: React.ReactNode
}

export function VolumeScrollbar({ children }: VolumeScrollbarProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateThumb = () => {
    if (!contentRef.current || !thumbRef.current || !containerRef.current || !barRef.current) return

    const content = contentRef.current
    const thumb = thumbRef.current
    const container = containerRef.current
    const bar = barRef.current

    const scrollableHeight = content.scrollHeight - content.clientHeight
    if (scrollableHeight <= 0) {
      bar.style.display = 'none'
      return
    }

    bar.style.display = 'block'
    const ratio = content.scrollTop / scrollableHeight
    const maxTop = container.clientHeight - thumb.clientHeight - 80 
    
    thumb.style.top = `${ratio * maxTop}px`
  }

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    content.addEventListener('scroll', updateThumb)
    window.addEventListener('resize', updateThumb)

    // Observe content changes (e.g. adding members to list)
    const observer = new MutationObserver(updateThumb)
    observer.observe(content, { childList: true, subtree: true })

    updateThumb()

    return () => {
      content.removeEventListener('scroll', updateThumb)
      window.removeEventListener('resize', updateThumb)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !contentRef.current || !thumbRef.current || !containerRef.current) return

      const content = contentRef.current
      const thumb = thumbRef.current
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      let offset = e.clientY - rect.top - 40
      const max = container.clientHeight - thumb.clientHeight - 80

      offset = Math.max(0, Math.min(offset, max))
      const ratio = offset / max
      content.scrollTop = ratio * (content.scrollHeight - content.clientHeight)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = 'auto'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="scroll-container" ref={containerRef}>
      <div className="scroll-content" ref={contentRef}>
        {children}
      </div>

      <div className="volume-bar" ref={barRef}>
        <div 
          className="volume-thumb" 
          ref={thumbRef}
          onMouseDown={() => {
            setIsDragging(true)
            document.body.style.userSelect = 'none'
          }}
        />
      </div>
    </div>
  )
}
