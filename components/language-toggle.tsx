'use client'

import { motion } from 'framer-motion'
import { useTranslation } from './language-provider'
import { Language } from '@/lib/translations'
import { cn } from '@/lib/utils'

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation()

  const handleToggle = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }

  const languages = [
    { id: 'en' as const, label: 'English', ariaLabel: 'Switch to English' },
    { id: 'ta' as const, label: 'தமிழ்', ariaLabel: 'தமிழுக்கு மாற்றவும்', className: 'font-tamil' },
  ]

  return (
    <div 
      className="relative bg-black/5 p-1.5 rounded-2xl flex w-full md:w-80 h-[52px] border border-black/5 shadow-inner"
      role="radiogroup"
      aria-label="Select Language"
    >
      {/* Sliding background indicator */}
      <motion.div
        initial={false}
        animate={{ x: language === 'en' ? 0 : '100%' }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5"
      />

      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => handleToggle(lang.id)}
          aria-checked={language === lang.id}
          role="radio"
          aria-label={lang.ariaLabel}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center text-sm font-semibold transition-all duration-300 rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            language === lang.id 
              ? "text-black scale-[1.02]" 
              : "text-black/40 hover:text-black/60",
            lang.className
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
