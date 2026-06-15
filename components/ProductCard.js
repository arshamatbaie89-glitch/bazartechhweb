"use client"

import Link from "next/link"
import Image from "next/image"
import StarRating from "./StarRating"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useToast } from "@/context/ToastContext"
import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"

export default function ProductCard({ product, featured }) {
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { addToast } = useToast()
  const { t, locale } = useLanguage()
  const images = product.images || []
  const inWishlist = isWishlisted(product.productId)

  const handleAddToCart = () => {
    addItem(product)
    addToast(t("product.addedToCartToast"), "success")
  }

  return (
    <div
      className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-accent/30 transition-all duration-300 flex flex-col ${featured ? "ring-2 ring-accent" : ""}`}
    >
      <Link
        href={`/product/${product.productId}`}
        className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden block"
      >
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
            No Image
          </div>
        )}
        {product.salePrice && (
          <span className="absolute top-2 left-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded-lg">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
        {featured && (
          <span className="absolute top-2 right-9 bg-primary text-accent text-xs font-bold px-2 py-1 rounded-lg">
            Featured
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleItem(product)
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${inWishlist ? "text-red-500 fill-red-500" : "text-gray-400"}`}
            stroke="currentColor"
            fill={inWishlist ? "currentColor" : "none"}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </Link>
      <div className="p-3 md:p-4 flex flex-col gap-1.5 flex-1">
        <Link href={`/product/${product.productId}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-accent transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating || 0} />
          <span className="text-xs text-gray-400">
            ({product.reviewCount || 0})
          </span>
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-accent">
                {formatPrice(locale, product.salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(locale, product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(locale, product.price)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              product.stock > 0
                ? "badge-success"
                : "badge-danger"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
          <span className="text-xs text-gray-400">
            {product.views} views
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="bg-[#1a365d] hover:bg-[#0f2440] text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-[0.98] w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? t("product.addToCart") : t("product.soldOut")}
        </button>
      </div>
    </div>
  )
}
