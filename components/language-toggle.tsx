'use client'

import { motion } from 'framer-motion'
import { useTranslation } from './language-provider'
import { Language } from '@/lib/translations'

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation()

  const handleToggle = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang)
    }
  }

  return (
    <div className="relative bg-slate-100 p-1.5 rounded-2xl flex w-full md:w-72 h-14 border border-slate-200 shadow-inner">
      {/* Sliding background indicator */}
      <motion.div
        initial={false}
        animate={{ x: language === 'en' ? 0 : '100%' }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md border border-slate-200/50"
      />

      {/* English Button */}
      <button
        onClick={() => handleToggle('en')}
        className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          language === 'en' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {t('english')}
      </button>

      {/* Tamil Button */}
      <button
        onClick={() => handleToggle('ta')}
        className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          language === 'ta' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {t('tamil')}
      </button>
    </div>
  )
}
