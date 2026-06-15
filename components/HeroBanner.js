"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

export default function HeroBanner() {
  const { t } = useLanguage()
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark min-h-[350px] md:min-h-[420px]">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl" />

      <div className="relative z-10 flex items-center justify-center min-h-[350px] md:min-h-[420px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <span className="inline-block text-accent font-semibold text-sm md:text-base tracking-widest uppercase mb-4 animate-slide-up">
            {t("hero.welcome")}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {t("site.tagline")}
          </h1>

          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {t("site.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/category/all" className="bg-[#FFC220] hover:bg-[#d4a000] text-[#1a365d] font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] text-sm md:text-base">
              {t("hero.shopNow")}
            </Link>
            <Link href="/category/all" className="border-2 border-white/40 hover:border-white text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] text-sm md:text-base">
              {t("hero.explore")}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/60 text-xs md:text-sm animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <span className="text-accent">★</span>
            <span>{t("hero.rating")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
