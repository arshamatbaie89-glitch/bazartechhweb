"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function AdminLayout({ children }) {
  const [auth, setAuth] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/admin/products", { method: "HEAD" })
        if (res.status === 401) { router.push("/adminlogin"); return }
        setAuth(true)
      } catch { router.push("/adminlogin") }
    }
    check()
  }, [router])

  if (!auth) return <div className="min-h-screen flex items-center justify-center"><svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Products", icon: "📦" },
    { href: "/admin/add-product", label: "Add Product", icon: "➕" },
    { href: "/admin/analytics", label: "Analytics", icon: "📈" },
    { href: "/admin/orders", label: "Orders", icon: "📋" },
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 hidden md:flex md:flex-col overflow-y-auto">
        <div className="flex-shrink-0 mb-8">
          <Link href="/" className="flex items-center gap-1.5 mb-4">
            <div className="w-6 h-6 rounded bg-[#1a365d] flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold">
              <span className="text-[#FFC220]">Baza</span><span className="text-yellow-500">rtech</span>
            </span>
          </Link>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your store</p>
        </div>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === item.href ? "bg-[#1a365d]/10 dark:bg-[#FFC220]/15 text-[#FFC220] dark:text-[#FFC220]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-shrink-0 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">← Back to Store</Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ThemeToggle /> <span className="text-xs">Toggle theme</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex gap-2 overflow-x-auto items-center flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 mr-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href ? "bg-[#1a365d]/10 dark:bg-[#FFC220]/15 text-[#FFC220] dark:text-[#FFC220]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>{item.icon} {item.label}</Link>
          ))}
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">{children}</div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-950 p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-[#1a365d] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="font-bold text-[#FFC220]">Bazartech</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Admin Panel</h2>
            <p className="text-xs text-gray-500 mb-6">Manage your store</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === item.href ? "bg-[#1a365d]/10 dark:bg-[#FFC220]/15 text-[#FFC220] dark:text-[#FFC220]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`}>
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">← Back to Store</Link>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ThemeToggle /> <span className="text-xs">Toggle theme</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
