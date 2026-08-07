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
        
        // Menggunakan en-US sebagai base untuk kalender Hijriah agar aman di semua browser mobile
        // Browser mobile ID sering bug menampilkan "SM" (Sebelum Masehi) pada kalender Hijriah
        const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-nu-latn', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).formatToParts(now);

        let d = '', m = '', y = '';
        for (const part of parts) {
          if (part.type === 'day') d = part.value;
          if (part.type === 'month') m = part.value;
          if (part.type === 'year') y = part.value;
        }

        const monthMap: Record<string, string> = {
          "Muharram": "Muharram",
          "Safar": "Safar",
          "Rabiʻ I": "Rabiul Awal",
          "Rabiʻ II": "Rabiul Akhir",
          "Jumada I": "Jumadil Awal",
          "Jumada II": "Jumadil Akhir",
          "Rajab": "Rajab",
          "Shaʻban": "Sya'ban",
          "Ramadan": "Ramadhan",
          "Shawwal": "Syawal",
          "Dhuʻl-Qiʻdah": "Dzulqa'dah",
          "Dhuʻl-Hijjah": "Dzulhijjah"
        };
        
        let hijriStr = `${d} ${monthMap[m] || m} ${y} H`;
        // Jika bahasa yang dipilih adalah Arab, gunakan locale arab asli (biasanya aman)
        if (language === 'ar') {
          hijriStr = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric', month: 'long', year: 'numeric'
          }).format(now) + ' H';
        }

        const hijri = hijriStr;

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
      <p className="font-semibold text-slate-900 dark:text-white">{date.gregorian}</p>
      <p className="text-slate-700 dark:text-slate-300 font-medium">{date.hijri}</p>
    </div>
  );
}




