"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bazartech-wishlist")
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem("bazartech-wishlist", JSON.stringify(items))
  }, [items, loaded])

  const toggleItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === product.productId)
      if (exists) return prev.filter((i) => i.productId !== product.productId)
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.images?.[0] || "",
        },
      ]
    })
  }, [])

  const isWishlisted = useCallback((productId) => items.some((i) => i.productId === productId), [items])

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isWishlisted, loaded }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
