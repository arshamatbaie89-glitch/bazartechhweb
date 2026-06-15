"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { t as translate, defaultLocale } from "@/lib/i18n"

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(defaultLocale)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bazartech-locale")
      if (stored && ["ar", "en"].includes(stored)) setLocaleState(stored)
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      try {
        document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
        document.documentElement.lang = locale
        document.title = translate(locale, "site.title")
      } catch {}
    }
  }, [locale, loaded])

  useEffect(() => {
    if (loaded) localStorage.setItem("bazartech-locale", locale)
  }, [locale, loaded])

  const setLocale = useCallback((l) => {
    if (["ar", "en"].includes(l)) setLocaleState(l)
  }, [])

  const dir = locale === "ar" ? "rtl" : "ltr"
  const isRTL = locale === "ar"

  const tFn = useCallback((key, params) => translate(locale, key, params), [locale])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir, isRTL, t: tFn, loaded }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
