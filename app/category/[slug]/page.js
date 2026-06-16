"use client"

import { useLanguage } from "@/context/LanguageContext"
import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"

const categoryNames = {
  "electronics-car": "Electronics & Car Accessories",
  "cosmetics-personal-care": "Cosmetics & Personal Care",
  "fashion-accessories": "Fashion & Accessories",
  "home-living": "Home & Living",
  "sports-camping": "Sports & Camping",
  "stationery-school-bags": "Stationery & School Bags",
  "cleaning-products": "Cleaning Products",
  "kitchen-dining": "Kitchen & Dining",
  "baby-kids": "Baby & Kids",
  "frozen-items": "Frozen Items",
  all: "All Products",
}

export default function CategoryPage() {
  const { t } = useLanguage()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("newest")

  useEffect(() => {
    setLoading(true)
    async function load() {
      try {
        const p = new URLSearchParams({ limit: "50", sort, ...(searchParams.get("search") ? { search: searchParams.get("search") } : {}), ...(slug !== "all" ? { category: slug } : {}) })
        const res = await fetch(`/api/products?${p}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products)
        }
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [slug, sort, searchParams])

  const catName = categoryNames[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-[#FFC220]">{t("category.home")}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-300">{catName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{catName}</h1>
          <p className="text-sm text-muted-foreground">{t("category.products", { count: products.length })}</p>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FFC220] outline-none">
          <option value="newest">{t("category.sortNewest")}</option>
          <option value="price-asc">{t("category.sortPriceAsc")}</option>
          <option value="price-desc">{t("category.sortPriceDesc")}</option>
          <option value="popular">{t("category.sortPopular")}</option>
          <option value="rating">{t("category.sortRating")}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="w-8 h-8 animate-spin text-[#FFC220]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-4xl mb-4">📭</div>
          <p>{t("category.noProducts")}</p>
          <Link href="/" className="text-[#FFC220] hover:underline mt-2 inline-block">{t("category.browseAll")}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
