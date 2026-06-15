"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { apiFetch } from "@/lib/api"

const categories = [
  { value: "general", label: "General" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home-living", label: "Home & Living" },
  { value: "sports", label: "Sports" },
  { value: "beauty", label: "Beauty" },
  { value: "books", label: "Books" },
]

export default function AddProduct() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "", description: "", price: "", salePrice: "",
    category: "general", stock: "0", featured: false, videoUrls: "",
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  async function handleImageUpload(e) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      for (const file of files) formData.append("files", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setImages((prev) => [...prev, ...data.urls])
    } catch (err) { setError(err.message) }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = "" }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await apiFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, description: form.description,
          price: parseFloat(form.price),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
          images, category: form.category, stock: parseInt(form.stock),
          featured: form.featured,
          videoUrls: form.videoUrls.split("\n").map((u) => u.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      router.push("/admin/products")
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Product</h1>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="80px" />
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1a365d]/10 dark:file:bg-[#FFC220]/15 file:text-[#FFC220] dark:file:text-[#FFC220] hover:file:bg-[#1a365d]/20 dark:hover:file:bg-[#FFC220]/20" />
          {uploading && <p className="text-sm text-[#FFC220] mt-1">Uploading...</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price</label>
            <input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#FFC220]" />
          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">Featured product</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={8} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none resize-y" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URLs</label>
          <textarea value={form.videoUrls} onChange={(e) => setForm({ ...form, videoUrls: e.target.value })} rows={3} placeholder="One URL per line" className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none resize-y" />
        </div>
        <button type="submit" disabled={submitting || uploading} className="w-full bg-[#1a365d] text-white py-3 rounded-xl font-semibold hover:bg-[#0f2440] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {submitting ? "Creating Product..." : "Create Product"}
        </button>
      </form>
    </div>
  )
}
