"use client"

import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import HeroBanner from "@/components/HeroBanner"
import CategoryGrid from "@/components/CategoryGrid"

import ProductCard from "@/components/ProductCard"
import { SkeletonProductGrid, SkeletonBanner } from "@/components/Skeleton"

function HomeContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState("newest")
  const loaderRef = useRef(null)

  const fetchProducts = useCallback(async (pageNum, append = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pageNum, limit: "12", sort,
        ...(searchParams.get("search") ? { search: searchParams.get("search") } : {}),
      })
      params.set("_t", Date.now())
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(`/api/products?${params}`, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      if (append) {
        setProducts((prev) => [...prev, ...data.products])
      } else {
        setProducts(data.products)
        setFeatured(data.products.filter((p) => p.featured).slice(0, 4))
      }
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err.message)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [sort, searchParams])

  useEffect(() => {
    setPage(1)
    fetchProducts(1)
  }, [fetchProducts])

  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) setPage((prev) => prev + 1) },
      { threshold: 0.1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  useEffect(() => {
    if (page > 1) fetchProducts(page, true)
  }, [page, fetchProducts])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12 md:space-y-16">
      <HeroBanner />
      <CategoryGrid />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{t("featured.title")}</h2>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} featured />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t("featured.empty")}</p>
        )}
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t("allProducts.title")}</h2>
            <p className="text-muted-foreground text-sm mt-1">{loading && !products.length ? t("allProducts.loading") : `${products.length} ${t("allProducts.products")}`}</p>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FFC220] outline-none transition-all w-auto text-sm"
          >
            <option value="newest">{t("allProducts.sortNewest")}</option>
            <option value="price-asc">{t("allProducts.sortPriceAsc")}</option>
            <option value="price-desc">{t("allProducts.sortPriceDesc")}</option>
            <option value="popular">{t("allProducts.sortPopular")}</option>
            <option value="rating">{t("allProducts.sortRating")}</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {loading && products.length === 0 ? (
          <SkeletonProductGrid count={10} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((product, i) => (
              <div key={product.id} style={{ animationDelay: `${(i % 12) * 30}ms` }} className="animate-fade-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex justify-center py-8">
          {loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("allProducts.loadingMore")}
            </div>
          )}
          {!hasMore && products.length > 0 && (
            <p className="text-muted-foreground/50 text-sm">{t("allProducts.end")}</p>
          )}
        </div>

        {!loading && products.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("allProducts.none")}</h2>
            <p className="text-muted-foreground">{t("allProducts.noneDesc")}</p>
          </div>
        )}
      </section>


    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        <SkeletonBanner />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800 animate-shimmer" />)}
        </div>
        <SkeletonProductGrid count={10} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
