"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"

export default function AdminOrdersPage() {
  const { t, locale } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("orders")

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) setOrders(await res.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { loadOrders() }, [])

  async function updateStatus(id, status) {
    try {
      const res = await apiFetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { loadOrders(); setTab(status === "accepted" ? "processing" : status === "completed" ? "history" : "history") }
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>

  const orderOrders = orders.filter((o) => o.status === "requested")
  const processingOrders = orders.filter((o) => o.status === "accepted")
  const historyOrders = orders.filter((o) => o.status === "rejected" || o.status === "completed")

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("adminOrders.title")}</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setTab("orders")} className={`pb-2 text-sm font-medium transition-colors ${tab === "orders" ? "text-[#FFC220] border-b-2 border-[#FFC220]" : "text-muted-foreground hover:text-foreground"}`}>
          Order {orderOrders.length > 0 && `(${orderOrders.length})`}
        </button>
        <button onClick={() => setTab("processing")} className={`pb-2 text-sm font-medium transition-colors ${tab === "processing" ? "text-[#FFC220] border-b-2 border-[#FFC220]" : "text-muted-foreground hover:text-foreground"}`}>
          Processing {processingOrders.length > 0 && `(${processingOrders.length})`}
        </button>
        <button onClick={() => setTab("history")} className={`pb-2 text-sm font-medium transition-colors ${tab === "history" ? "text-[#FFC220] border-b-2 border-[#FFC220]" : "text-muted-foreground hover:text-foreground"}`}>
          Order History
        </button>
      </div>

      {tab === "orders" && orderOrders.length === 0 && (
        <p className="text-muted-foreground">{t("adminOrders.empty")}</p>
      )}

      {tab === "processing" && processingOrders.length === 0 && (
        <p className="text-muted-foreground">No processing orders.</p>
      )}

      {tab === "history" && historyOrders.length === 0 && (
        <p className="text-muted-foreground">No order history yet.</p>
      )}

      <div className="space-y-4">
        {(tab === "orders" ? orderOrders : tab === "processing" ? processingOrders : historyOrders).map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {(() => {
                        try {
                          const orderItems = JSON.parse(order.items || "[]")
                          if (orderItems.length > 1) return `${orderItems.length} ${t("adminOrders.items")}`
                          return order.productName
                        } catch { return order.productName }
                      })()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      order.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      order.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>{order.status === "completed" ? t("adminOrders.completed") : order.status}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {(() => {
                      try {
                        const orderItems = JSON.parse(order.items || "[]")
                        if (orderItems.length === 0) return null
                        return orderItems.map((item, i) => (
                          <Link key={i} href={`/product/${item.productId}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                            <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt="" width={96} height={96} className="object-cover w-full h-full scale-150" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg text-muted-foreground">📷</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate group-hover:text-[#FFC220] transition-colors">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">ID: {item.productId} · {formatPrice(locale, item.price)}</p>
                            </div>
                            <span className="flex-shrink-0 text-xs font-semibold text-foreground">×{item.quantity || 1}</span>
                          </Link>
                        ))
                      } catch {
                        return (
                          <Link href={`/product/${order.productId}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate group-hover:text-[#FFC220] transition-colors">{order.productName}</p>
                              <p className="text-xs text-muted-foreground">ID: {order.productId} · {formatPrice(locale, order.price)}</p>
                            </div>
                            <span className="flex-shrink-0 text-xs font-semibold text-foreground">×{order.quantity}</span>
                          </Link>
                        )
                      }
                    })()}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {order.customerName || "—"}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {order.customerPhone || "—"}</p>
                    <p><span className="text-muted-foreground">Address:</span> {order.customerAddress || "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {order.status === "requested" && (
                    <>
                      <button onClick={() => updateStatus(order.id, "accepted")} className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        {t("adminOrders.accept")}
                      </button>
                      <button onClick={() => updateStatus(order.id, "rejected")} className="px-4 py-1.5 border border-red-200 dark:border-red-800 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        {t("adminOrders.reject")}
                      </button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <>
                      <button onClick={() => { navigator.clipboard.writeText(order.customerPhone); alert(t("adminOrders.phoneCopied")) }} className="px-4 py-1.5 bg-[#FFC220] text-[#1a365d] text-xs font-semibold rounded-lg hover:bg-[#d4a000] transition-colors">
                        {t("adminOrders.copyPhone")}
                      </button>
                      <button onClick={() => updateStatus(order.id, "completed")} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        {t("adminOrders.moveToHistory")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
