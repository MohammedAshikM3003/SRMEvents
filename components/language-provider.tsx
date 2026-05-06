'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationKey } from '@/lib/translations';
import { createClient } from '@/lib/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// The same fallback ID used in the rest of the app for bypass
const FALLBACK_USER_ID = '105ea82f-76d3-4c88-b03d-e135e55d88b3';

export function LanguageProvider({ 
  children, 
}: { 
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>('en');
  const supabase = createClient();

  useEffect(() => {
    // 1. Immediate load from localStorage for speed
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }

    // 2. Sync with database
    const syncLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || FALLBACK_USER_ID;
      
      const { data: settings } = await supabase
        .from('settings')
        .select('language')
        .eq('user_id', userId)
        .single();
      
      if (settings?.language) {
        const lang = settings.language as Language;
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      }
    };
    syncLanguage();
  }, [supabase]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to local storage and cookie for instant persistence
    localStorage.setItem('language', lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || FALLBACK_USER_ID;

    // Update DB
    await supabase
      .from('settings')
      .update({ language: lang })
      .eq('user_id', userId);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const text = translations[language][key] || translations['en'][key] || key;
    
    if (params && typeof text === 'string') {
      let interpolated = text;
      Object.entries(params).forEach(([k, v]) => {
        interpolated = interpolated.replace(`{${k}}`, v.toString());
      });
      return interpolated;
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
