"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import StarRating from "@/components/StarRating"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "@/lib/i18n"
import OrderModal from "./OrderModal"

function getVideoEmbed(url) {
  if (!url) return null
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtube) return { type: "youtube", id: youtube[1] }
  const tiktok = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/)
  if (tiktok) return { type: "tiktok", id: tiktok[1] }
  const instagram = url.match(/(?:instagram\.com\/p\/|instagram\.com\/reel\/)([a-zA-Z0-9_-]+)/)
  if (instagram) return { type: "instagram", id: instagram[1] }
  return null
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()
  const { toggleItem, isWishlisted } = useWishlist()
  const { t, locale } = useLanguage()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error("Product not found")
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  function handleAddToCart() {
    if (!product) return
    addItem(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <svg className="w-8 h-8 animate-spin text-[#1a365d]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  }

  if (error || !product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t("product.notFound")}</h1>
      <p className="text-muted-foreground mt-2">{error}</p>
      <Link href="/" className="text-[#FFC220] hover:underline mt-4 inline-block">← Back to store</Link>
    </div>
  }

  const images = product.images || []
  const videoUrls = product.videoUrls || []
  const videos = videoUrls.map(getVideoEmbed).filter(Boolean)
  const inWishlist = isWishlisted(product.productId)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-[#FFC220]">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${product.category || "all"}`} className="hover:text-[#FFC220]">{product.category || "Products"}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-300">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative mb-4">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage] || images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">{t("product.noImage")}</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    i === selectedImage ? "border-[#1a365d] shadow-md" : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-muted-foreground px-2.5 py-1 rounded-lg">{t("product.id")}: {product.productId}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${product.stock > 0 ? "bg-[#bbf7d0] text-[#16a34a] dark:bg-[#22c55e]/15 dark:text-[#22c55e]" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {product.stock > 0 ? `${t("product.inStock")} (${product.stock})` : t("product.outOfStock")}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating || 0} size="lg" />
            <span className="text-sm text-muted-foreground">({product.reviewCount || 0} {t("product.reviews")})</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">{formatPrice(locale, product.salePrice)}</span>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(locale, product.price)}</span>
                <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full font-medium">
                  {t("product.save")} {formatPrice(locale, product.price - product.salePrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-foreground">{formatPrice(locale, product.price)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{product.views} {t("product.peopleViewing")}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                addedToCart
                  ? "bg-[#22c55e] text-white"
                  : "bg-[#1a365d] text-white hover:bg-[#0f2440] active:scale-[0.98]"
              } disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed shadow-lg shadow-[#FFC220]/20 dark:shadow-[#FFC220]/20`}
            >
              {addedToCart ? t("product.addedToCart") : product.stock > 0 ? t("product.addToCart") : t("product.soldOut")}
            </button>
            <button
              onClick={() => toggleItem(product)}
              className={`px-6 py-4 rounded-xl font-semibold border-2 transition-all ${
                inWishlist
                  ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "border-gray-200 dark:border-gray-700 text-foreground/80 hover:border-red-300 hover:text-red-500"
              }`}
            >
              <svg className="w-5 h-5 inline mr-1" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {inWishlist ? t("product.wishlisted") : t("product.wishlist")}
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-6 py-4 rounded-xl font-semibold bg-[#FFC220] text-[#1a365d] hover:bg-[#d4a000] transition-all active:scale-[0.98]"
            >
              {t("product.orderNow")}
            </button>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h3 className="text-lg font-semibold text-foreground mb-3">{t("product.description")}</h3>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <h3 className="font-semibold text-foreground mb-2">{t("product.share")}</h3>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert(t("product.linkCopied")) }} className="text-sm text-[#FFC220] hover:underline">
                {t("product.copyLink")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="w-full mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6 px-4 max-w-7xl mx-auto">{t("product.videos")}</h3>
          <div className="space-y-2">
            {videos.map((video, i) => (
              <div key={i} className="w-full h-[750px] bg-black">
                {video.type === "youtube" && (
                  <iframe src={`https://www.youtube.com/embed/${video.id}`} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                )}
                {video.type === "tiktok" && (
                  <iframe src={`https://www.tiktok.com/embed/v2/${video.id}`} className="w-full h-full" allowFullScreen />
                )}
                {video.type === "instagram" && (
                  <iframe src={`https://www.instagram.com/p/${video.id}/embed`} className="w-full h-full" allowFullScreen />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showOrderModal && <OrderModal product={product} onClose={() => setShowOrderModal(false)} />}
    </div>
  )
}
