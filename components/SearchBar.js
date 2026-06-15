"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SearchBar() {
  const { t, locale } = useLanguage()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
          setOpen(true)
        }
      } catch {} finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(productId) {
    setOpen(false)
    setQuery("")
    router.push(`/product/${productId}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/category/all?search=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#FFC220] outline-none transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#1a365d] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </form>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {results.map((p) => (
            <button
              key={p.productId}
              onClick={() => handleSelect(p.productId)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                {(p.images?.[0]) ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(locale, p.salePrice || p.price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
