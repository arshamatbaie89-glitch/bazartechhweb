"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

const categories = [
  { name: "Electronics & Car Accessories", slug: "electronics-car", icon: "🔌", gradient: "from-blue-500/20 to-cyan-500/20", glow: "hover:shadow-blue-500/20" },
  { name: "Cosmetics & Personal Care", slug: "cosmetics-personal-care", icon: "💄", gradient: "from-pink-500/20 to-rose-500/20", glow: "hover:shadow-pink-500/20" },
  { name: "Fashion & Accessories", slug: "fashion-accessories", icon: "👗", gradient: "from-purple-500/20 to-violet-500/20", glow: "hover:shadow-purple-500/20" },
  { name: "Home & Living", slug: "home-living", icon: "🏠", gradient: "from-amber-500/20 to-yellow-500/20", glow: "hover:shadow-amber-500/20" },
  { name: "Sports & Camping", slug: "sports-camping", icon: "⚽", gradient: "from-emerald-500/20 to-green-500/20", glow: "hover:shadow-emerald-500/20" },
  { name: "Stationery & School Bags", slug: "stationery-school-bags", icon: "📚", gradient: "from-indigo-500/20 to-blue-500/20", glow: "hover:shadow-indigo-500/20" },
  { name: "Cleaning Products", slug: "cleaning-products", icon: "🧹", gradient: "from-sky-500/20 to-blue-400/20", glow: "hover:shadow-sky-500/20" },
  { name: "Kitchen & Dining", slug: "kitchen-dining", icon: "🍳", gradient: "from-orange-500/20 to-red-500/20", glow: "hover:shadow-orange-500/20" },
  { name: "Baby & Kids", slug: "baby-kids", icon: "👶", gradient: "from-pink-400/20 to-sky-400/20", glow: "hover:shadow-pink-400/20" },
  { name: "Frozen Items", slug: "frozen-items", icon: "❄️", gradient: "from-cyan-400/20 to-blue-400/20", glow: "hover:shadow-cyan-400/20" },
]

export default function CategoryGrid() {
  const { t } = useLanguage()
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("categories.title")}</h2>
        <Link href="/category/all" className="text-sm font-medium text-[#FFC220] hover:underline">
          {t("categories.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group card-hover"
          >
            <div
              className={`rounded-2xl p-6 min-h-[140px] flex flex-col items-center justify-center bg-gradient-to-br ${cat.gradient} bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-xl ${cat.glow} group-hover:ring-[#FFC220]`}
            >
              <span className="text-4xl mb-3">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center leading-tight">
                {t(`categories.${cat.slug}`)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
