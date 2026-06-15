"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/analytics")
        if (res.status === 401) { router.push("/adminlogin"); return }
        if (!res.ok) throw new Error("Failed to load analytics")
        setData(await res.json())
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )
  if (error) return <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">{error}</div>

  const stats = [
    { label: "Total Products", value: data.totalProducts, icon: "📦", color: "bg-[#1a365d]/10 dark:bg-[#FFC220]/15 text-[#FFC220] dark:text-[#FFC220]" },
    { label: "Total Views", value: data.totalViews.toLocaleString(), icon: "👁️", color: "bg-[#bbf7d0] dark:bg-[#22c55e]/15 text-[#16a34a] dark:text-[#22c55e]" },
    { label: "Total Orders", value: data.totalOrders, icon: "📋", color: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" },
    { label: "Out of Stock", value: data.outOfStock, icon: "⚠️", color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  ]

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Most Viewed Products</h2>
          {data.mostViewed.length === 0 ? <p className="text-muted-foreground text-sm">No data yet</p> : (
            <div className="space-y-3">
              {data.mostViewed.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-gray-400 w-5">#{i + 1}</span>
                    <span className="text-sm text-foreground truncate">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#FFC220] dark:text-[#FFC220] flex-shrink-0">{p.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Recently Added</h2>
          {data.recentProducts.length === 0 ? <p className="text-muted-foreground text-sm">No data yet</p> : (
            <div className="space-y-3">
              {data.recentProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()} · OMR {p.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{p.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
