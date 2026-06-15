"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"

function validateOmanPhone(phone) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  const local = digits.replace(/^968/, "")
  if (local.length !== 8) return false
  if (!/^[7924]/.test(local)) return false
  return true
}

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

export default function OrderModal({ product, onClose }) {
  const { t, locale } = useLanguage()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const handleOverlay = useCallback((e) => {
    if (e.target === e.currentTarget && !submitting) onClose()
  }, [onClose, submitting])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleEsc = (e) => { if (e.key === "Escape" && !submitting) onClose() }
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleEsc)
    }
  }, [onClose, submitting])

  const phoneWarning = getPhoneWarning(phone, t)
  const addressWarning = getAddressWarning(address, t)
  const hasWarnings = phoneWarning || addressWarning

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.productId,
          productName: product.name,
          price: product.salePrice || product.price,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          quantity: 1,
          image: product.images?.[0] || "",
        }),
      })
      if (!res.ok) throw new Error(t("order.failed"))
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlay}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">{t("order.title")}</h2>
          <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-muted-foreground transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <p className="font-semibold text-foreground text-sm">{product.name}</p>
          <p className="text-lg font-bold mt-1">{formatPrice(locale, product.salePrice || product.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("order.productId")}: {product.productId}</p>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-foreground text-lg mb-2">{t("order.submitted")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("order.whatsappNotice")}
            </p>
            <button onClick={onClose} className="bg-[#1a365d] text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-[#0f2440] transition-colors">
              {t("order.done")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("order.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm"
                placeholder={t("order.namePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("order.phone")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm"
                placeholder={t("order.phonePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t("order.address")}</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-[#FFC220] outline-none transition-all text-sm resize-none"
                placeholder={t("order.addressPlaceholder")}
              />
            </div>

            {hasWarnings && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">{t("order.warningTitle")}</p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-0.5">
                  {phoneWarning && <li>• {phoneWarning}</li>}
                  {addressWarning && <li>• {addressWarning}</li>}
                </ul>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t("order.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#1a365d] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2440] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {t("order.submitting")}</>
                ) : t("order.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
