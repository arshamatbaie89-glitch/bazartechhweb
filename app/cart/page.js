"use client"

import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"
import { useCart } from "@/context/CartContext"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

function getPhoneWarning(phone, t) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  const local = digits.replace(/^968/, "")
  if (local.length !== 8) return t("order.phoneWarningLength")
  if (!/^[7924]/.test(local)) return t("order.phoneWarningStart")
  return null
}

function getAddressWarning(address, t) {
  if (!address || address.trim().length < 5) return t("order.addressWarning")
  return null
}

export default function CartPage() {
  const { t, locale, isRTL } = useLanguage()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [showClear, setShowClear] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [orderError, setOrderError] = useState(null)

  const phoneWarning = getPhoneWarning(phone, t)
  const addressWarning = getAddressWarning(address, t)
  const hasWarnings = phoneWarning || addressWarning

  async function handleSubmitOrder(e) {
    e.preventDefault()
    setSubmitting(true)
    setOrderError(null)
    try {
      const res = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "",
          })),
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || t("order.failed"))
      }
      setDone(true)
      clearCart()
      window.open("https://api.whatsapp.com/send?phone=96897484837", "_blank")
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("cart.empty")}</h1>
        <p className="text-muted-foreground mb-6">{t("cart.emptyDesc")}</p>
        <Link href="/" className="inline-block bg-[#1a365d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0f2440] transition-colors">
          {t("cart.startShopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t("cart.title")} ({t("cart.items", { count: items.length })})</h1>
        <button
          onClick={() => setShowClear(true)}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          {t("cart.clearAll")}
        </button>
      </div>

      {showClear && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowClear(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2">{t("cart.clearTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("cart.clearDesc")}</p>
            <div className="flex gap-3">
              <button onClick={() => { clearCart(); setShowClear(false) }} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700">{t("cart.clear")}</button>
              <button onClick={() => setShowClear(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700">{t("cart.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex gap-4 animate-fade-in">
              <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`} className="font-semibold text-foreground hover:text-[#FFC220] transition-colors line-clamp-1">{item.name}</Link>
                <p className="text-lg font-bold text-foreground mt-1">{formatPrice(locale, item.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">−</button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-gray-200 dark:border-gray-700">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-sm text-red-500 hover:text-red-700 font-medium">
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-foreground">{formatPrice(locale, item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 h-fit sticky top-24">
          <h3 className="font-bold text-lg text-foreground mb-4">{t("cart.checkout")}</h3>

          {done ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-foreground text-sm">{t("order.submitted")}</p>
              <p className="text-xs text-muted-foreground mt-2">{t("order.whatsappNotice")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-3">
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground">{t("order.product")}s ({items.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span key={item.productId} className="text-xs bg-gray-100 dark:bg-gray-800 text-foreground px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      {item.productId} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("order.name")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm" placeholder={t("order.namePlaceholder")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("order.phone")}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm" placeholder={t("order.phonePlaceholder")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{t("order.address")}</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm resize-none" placeholder={t("order.addressPlaceholder")} />
              </div>

              {hasWarnings && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-2.5">
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-0.5">{t("order.warningTitle")}</p>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-0.5">
                    {phoneWarning && <li>• {phoneWarning}</li>}
                    {addressWarning && <li>• {addressWarning}</li>}
                  </ul>
                </div>
              )}

              {orderError && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5">{orderError}</p>
              )}

              <button type="submit" disabled={submitting} className="w-full bg-[#1a365d] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0f2440] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#FFC220]/20 dark:shadow-[#FFC220]/20">
                {submitting ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {t("order.submitting")}</> : t("order.submit")}
              </button>

              <Link href="/" className="block text-center text-xs text-[#FFC220] hover:underline">
                {t("cart.continueShopping")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
