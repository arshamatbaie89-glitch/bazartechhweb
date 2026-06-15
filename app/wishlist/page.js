"use client"

import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"
import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import Link from "next/link"
import Image from "next/image"

export default function WishlistPage() {
  const { t, locale } = useLanguage()
  const { items, toggleItem } = useWishlist()
  const { addItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🤍</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("wishlist.empty")}</h1>
        <p className="text-muted-foreground mb-6">{t("wishlist.emptyDesc")}</p>
        <Link href="/" className="inline-block bg-[#1a365d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0f2440] transition-colors">
          {t("wishlist.startShopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t("wishlist.title")} ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.productId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
            <Link href={`/product/${item.productId}`} className="block aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </Link>
            <div className="p-3">
              <Link href={`/product/${item.productId}`} className="text-sm font-medium text-foreground line-clamp-2 hover:text-[#FFC220] transition-colors">
                {item.name}
              </Link>
              <p className="font-bold text-foreground mt-1">{formatPrice(locale, item.price)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => addItem({ productId: item.productId, name: item.name, price: item.price, images: [item.image] })} className="flex-1 text-xs bg-[#1a365d] text-white py-2 rounded-lg font-semibold hover:bg-[#0f2440] transition-colors">
                  Add to Cart
                </button>
                <button onClick={() => toggleItem(item)} className="px-3 py-2 text-xs border border-red-200 dark:border-red-800 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {t("wishlist.remove")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
