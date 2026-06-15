"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Login failed") }
      router.push("/verify-otp")
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a365d] flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#FFC220]">Mal</span><span className="text-[#FFC220]">mart</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your dashboard</p>
          </div>
          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 input-field text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 input-field text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#FFC220] outline-none transition-colors" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a365d] text-white py-3 rounded-xl font-semibold hover:bg-[#0f2440] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? "Signing in..." : "Sign In"}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
