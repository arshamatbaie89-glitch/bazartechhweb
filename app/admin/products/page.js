"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { apiFetch } from "@/lib/api"

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products")
      if (res.status === 401) { router.push("/adminlogin"); return }
      if (!res.ok) throw new Error("Failed to load")
      setProducts(await res.json())
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProducts() }, [])

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return
    try {
      const res = await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) { setError(err.message) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <svg className="animate-spin w-8 h-8 text-[#FFC220]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Products ({products.length})</h1>
        <Link href="/admin/add-product" className="bg-[#1a365d] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f2440] transition-colors">+ Add Product</Link>
      </div>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground"><div className="text-4xl mb-4">📦</div><p>No products yet.</p><Link href="/admin/add-product" className="text-[#FFC220] hover:underline mt-2 inline-block">Add your first product</Link></div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden md:table-cell">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground hidden sm:table-cell">Views</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                          {(product.images || []).length > 0 ? <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">NA</div>}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground text-sm line-clamp-1">{product.name}</span>
                          {product.featured && <span className="text-xs text-yellow-600 ml-2">★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="font-mono text-xs text-muted-foreground">{product.productId}</span></td>
                    <td className="px-4 py-3">{product.salePrice ? <div className="flex items-center gap-1"><span className="font-semibold text-red-600">OMR {product.salePrice.toFixed(2)}</span><span className="text-xs text-muted-foreground line-through">OMR {product.price.toFixed(2)}</span></div> : <span className="font-semibold">OMR {product.price.toFixed(2)}</span>}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`text-sm font-medium ${product.stock > 0 ? "text-[#22c55e]" : "text-red-600"}`}>{product.stock}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-muted-foreground">{product.views}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/edit-product/${product.id}`} className="px-3 py-1.5 text-sm bg-[#1a365d]/10 dark:bg-[#FFC220]/15 text-[#FFC220] dark:text-[#FFC220] rounded-xl hover:bg-[#1a365d]/20 dark:hover:bg-[#FFC220]/20 transition-colors">Edit</Link>
                        <button onClick={() => handleDelete(product.id)} className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
