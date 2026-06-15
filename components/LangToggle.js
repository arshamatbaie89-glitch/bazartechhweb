"use client"

import { useLanguage } from "@/context/LanguageContext"

export default function LangToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase"
      title={locale === "ar" ? "English" : "العربية"}
    >
      {locale === "ar" ? "EN" : "ع"}
    </button>
  )
}
