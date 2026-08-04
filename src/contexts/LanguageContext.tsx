"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';
import { useAppConfig } from '@/contexts/AppConfigContext';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en' || savedLang === 'ar')) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const { tipeBisnis } = useAppConfig();

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Use type assertion to silence TS errors since keys aren't strictly typed
    const dict = translations[language] as Record<string, string>;
    const fallbackDict = translations['id'] as Record<string, string>;
    
    let text = dict[key] || fallbackDict[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }

    // Auto-replace terminology based on tipeBisnis
    if (language === 'id' || language === 'en') {
      if (tipeBisnis === 'PERUSAHAAN') {
         text = text.replace(/Santri/g, 'Klien').replace(/santri/g, 'klien');
         text = text.replace(/Siswa/g, 'Klien').replace(/siswa/g, 'klien');
         text = text.replace(/Wali Santri/g, 'Penanggung Jawab').replace(/wali santri/g, 'penanggung jawab');
         text = text.replace(/Nama Wali/g, 'Penanggung Jawab').replace(/nama wali/g, 'penanggung jawab');
         text = text.replace(/Wali/g, 'P.Jawab').replace(/wali/g, 'p.jawab');
         text = text.replace(/NIS/g, 'ID Klien');
         text = text.replace(/Kelas/g, 'Layanan');
         text = text.replace(/SPP/g, 'Layanan/Tagihan').replace(/spp/g, 'layanan/tagihan');
         text = text.replace(/Tagihan Layanan\/Tagihan/g, 'Tagihan Klien');
         text = text.replace(/Status Layanan\/Tagihan/g, 'Status Pembayaran');
         text = text.replace(/Tunggakan Layanan\/Tagihan/g, 'Tunggakan');
      } else if (tipeBisnis === 'PENDIDIKAN') {
         text = text.replace(/Santri/g, 'Siswa').replace(/santri/g, 'siswa');
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
