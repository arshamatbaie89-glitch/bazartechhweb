"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useToast } from "@/context/ToastContext"

export default function AdminDashboard() {
  const [lookupId, setLookupId] = useState("")
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [recentLookups, setRecentLookups] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const inputRef = useRef(null)
  const { addToast } = useToast()

  useEffect(() => {
    const stored = localStorage.getItem("bazartech-recent-lookups")
    if (stored) setRecentLookups(JSON.parse(stored))
  }, [])

  function saveRecent(product) {
    const updated = [{ name: product.name, productId: product.productId, id: product.id, image: product.images?.[0] || null, timestamp: Date.now() }, ...recentLookups.filter((r) => r.productId !== product.productId)].slice(0, 5)
    setRecentLookups(updated)
    localStorage.setItem("bazartech-recent-lookups", JSON.stringify(updated))
  }

  useEffect(() => {
    if (lookupId.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(lookupId.trim())}&limit=5`)
        if (res.ok) { const d = await res.json(); setSuggestions(d.products || []); setShowSuggestions(true) }
      } catch {}
    }, 200)
    return () => clearTimeout(timer)
  }, [lookupId])

  async function handleLookup(id) {
    const searchId = id || lookupId.trim()
    if (!searchId) return
    setLookupLoading(true)
    setLookupError("")
    setLookupResult(null)
    setShowSuggestions(false)
    setShowRecent(false)
    try {
      const res = await fetch(`/api/admin/quick-lookup/${searchId}`)
      if (res.status === 404) throw new Error("Product not found")
      if (!res.ok) throw new Error("Lookup failed")
      const data = await res.json()
      setLookupResult(data)
      saveRecent(data)
    } catch (err) {
      setLookupError(err.message)
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleUpdateStock(productId, newStock) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      })
      if (!res.ok) throw new Error("Failed")
      const updated = await res.json()
      setLookupResult(updated)
      addToast("Stock updated!", "success")
    } catch { addToast("Failed to update stock", "error") }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your store and products</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Quick Item Lookup</h2>
            <p className="text-xs text-muted-foreground">Search by Product ID (e.g. PRD-123456) or product name</p>
          </div>
        </div>

        <div className="relative" ref={inputRef}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleLookup() }}
            className="flex gap-3"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onFocus={() => { if (recentLookups.length && !lookupId.trim()) setShowRecent(true) }}
                onBlur={() => setTimeout(() => { setShowSuggestions(false); setShowRecent(false) }, 200)}
                placeholder="Type Product ID or name..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-[#FFC220] outline-none transition-all pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {lookupLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            <button type="submit" disabled={lookupLoading} className="bg-[#1a365d] hover:bg-[#0f2440] text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] text-sm whitespace-nowrap">
              {lookupLoading ? "Searching..." : "Look Up"}
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
              {suggestions.map((p) => (
                <button
                  key={p.productId}
                  onMouseDown={() => { handleLookup(p.productId) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.productId} · OMR {(p.salePrice || p.price).toFixed(2)}</p>
                  </div>
                  <span className="text-xs text-accent font-semibold">Look up →</span>
                </button>
              ))}
            </div>
          )}

          {showRecent && recentLookups.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-scale-in">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                Recent Lookups
              </div>
              {recentLookups.map((r) => (
                <button
                  key={r.productId}
                  onMouseDown={() => { setLookupId(r.productId); handleLookup(r.productId) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                    {r.image ? <img src={r.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.productId}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {lookupError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-danger">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lookupError}
          </div>
        )}

        {lookupResult && (
          <div className="mt-5 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
              <div className="w-full md:w-40 h-40 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {(lookupResult.images || []).length > 0 ? (
                  <Image src={lookupResult.images[0]} alt="" width={160} height={160} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{lookupResult.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-muted-foreground">{lookupResult.productId}</span>
                    <span className="text-xs text-muted-foreground">SKU: {lookupResult.productId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-bold text-foreground text-lg">OMR {(lookupResult.salePrice || lookupResult.price).toFixed(2)}</p>
                    {lookupResult.salePrice && <p className="text-xs text-muted-foreground line-through">OMR {lookupResult.price.toFixed(2)}</p>}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Inventory</p>
                    <p className={`font-bold text-lg ${lookupResult.stock > 10 ? "text-success" : lookupResult.stock > 0 ? "text-warning" : "text-danger"}`}>
                      {lookupResult.stock}
                    </p>
                    <p className="text-xs text-muted-foreground">{lookupResult.stock > 10 ? "In Stock" : lookupResult.stock > 0 ? "Low Stock" : "Out of Stock"}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold text-foreground text-sm capitalize">{lookupResult.category || "General"}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`badge mt-1 ${lookupResult.stock > 0 ? "badge-success" : "badge-danger"}`}>
                      {lookupResult.stock > 0 ? "Active" : "Inactive"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{lookupResult.views} views</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link href={`/admin/edit-product/${lookupResult.id}`} className="bg-[#1a365d] hover:bg-[#0f2440] text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] text-sm !py-2 !px-4">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit Product
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateStock(lookupResult.id, lookupResult.stock - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >−</button>
                    <span className="w-12 text-center text-sm font-semibold">{lookupResult.stock}</span>
                    <button
                      onClick={() => handleUpdateStock(lookupResult.id, lookupResult.stock + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >+</button>
                    <span className="text-xs text-muted-foreground ml-1">Adjust stock</span>
                  </div>
                  <Link href={`/product/${lookupResult.productId}`} target="_blank" className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#1a365d] dark:hover:border-[#FFC220] text-foreground font-semibold py-3 px-6 rounded-xl transition-all text-sm !py-2 !px-4">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/products" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 group hover:shadow-lg hover:border-[#FFC220]/50 dark:hover:border-[#FFC220] transition-all duration-200">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-bold text-foreground">Manage Products</h3>
          <p className="text-sm text-muted-foreground mt-1">View, edit, or remove products</p>
        </Link>
        <Link href="/admin/add-product" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 group hover:shadow-lg hover:border-[#FFC220]/50 dark:hover:border-[#FFC220] transition-all duration-200">
          <div className="text-3xl mb-3">➕</div>
          <h3 className="font-bold text-foreground">Add Product</h3>
          <p className="text-sm text-muted-foreground mt-1">Create a new product listing</p>
        </Link>
        <Link href="/admin/analytics" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 group hover:shadow-lg hover:border-[#FFC220]/50 dark:hover:border-[#FFC220] transition-all duration-200">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-bold text-foreground">Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">View real product statistics</p>
        </Link>
      </div>
    </div>
  )
}
