"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function CurrentDate() {
  const { language, t } = useLanguage();
  const [date, setDate] = useState({
    gregorian: "Loading...",
    hijri: "Loading...",
  });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      let locale = 'id-ID';
      let localeHijri = 'id-ID-u-ca-islamic';

      if (language === 'en') {
        locale = 'en-US';
        localeHijri = 'en-US-u-ca-islamic';
      } else if (language === 'ar') {
        locale = 'ar-SA';
        localeHijri = 'ar-SA-u-ca-islamic';
      }
      
      try {
        const gregorian = new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(now);
        
        const hijri = new Intl.DateTimeFormat(localeHijri, {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(now) + ' H';

        setDate({ gregorian, hijri });
      } catch (e) {
        setDate({ gregorian: '', hijri: '' });
      }
    };

    updateDate();
    // Update setiap hari tepat pada pergantian hari, tapi setInterval 1 jam sudah cukup aman
    const interval = setInterval(updateDate, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="text-xs">
      <p className="font-semibold text-white">{date.gregorian}</p>
      <p className="text-slate-400">{date.hijri}</p>
    </div>
  );
}
