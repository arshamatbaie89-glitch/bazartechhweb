"use client"

import { useLanguage } from "@/context/LanguageContext"

export default function TrustSection() {
  const { t } = useLanguage()
  const metrics = [
    { value: "20,000+", label: t("trust.area"), icon: "🏪" },
    { value: "4", label: t("trust.branches"), icon: "📍" },
    { value: "4.8/5", label: t("trust.rating"), icon: "⭐" },
    { value: "10,000+", label: t("trust.customers"), icon: "😊" },
  ]

  const features = [
    {
      title: "Direct from Factory",
      description: "We source directly from manufacturers, ensuring the best prices without middlemen.",
      icon: "🏭",
    },
    {
      title: "Quality Guaranteed",
      description: "Every product meets our strict quality standards before reaching your hands.",
      icon: "✅",
    },
    {
      title: "Multiple Branches",
      description: "Visit any of our 5+ branches across Oman for a premium shopping experience.",
      icon: "📍",
    },
    {
      title: "Best Value",
      description: "From 100 baisa to premium items, we offer unbeatable value across all categories.",
      icon: "💎",
    },
  ]

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("trust.title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("trust.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center group hover:border-[#FFC220]/50 dark:hover:border-[#FFC220] transition-colors">
            <div className="text-3xl mb-2">{m.icon}</div>
            <div className="text-2xl font-bold text-primary dark:text-accent">{m.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 card bg-gradient-to-r from-primary to-primary-dark p-8 md:p-10 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{t("trust.vision")}</h3>
        <p className="text-white/80 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
          {t("trust.visionText")}
        </p>
      </div>
    </section>
  )
}
