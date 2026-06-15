"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bazartech-cart")
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem("bazartech-cart", JSON.stringify(items))
  }, [items, loaded])

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId ? { ...i, quantity: i.quantity + qty } : i
        )
      }
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.images?.[0] || "",
          quantity: qty,
          stock: product.stock || 0,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId, qty) => {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, loaded }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
