"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [verified, setVerified] = useState(false)
  const router = useRouter()
  const inputRefs = useRef([])

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus()
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  function handleChange(index, value) {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = data[i] || ""
    }
    setOtp(newOtp)
    const next = Math.min(data.length, 5)
    inputRefs.current[next]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Verification failed")
      setVerified(true)
      setTimeout(() => router.push("/admin"), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setCooldown(60)
    setError("")
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        if (data.cooldown) setCooldown(data.cooldown)
        throw new Error(data.error || "Failed to resend")
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (verified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Verified!</h2>
          <p className="text-muted-foreground mt-1">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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
            <h1 className="text-xl font-bold text-foreground">Two-Factor Authentication</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter the 6-digit code sent to your email</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-foreground focus:ring-2 focus:ring-[#FFC220] focus:border-[#FFC220] outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-[#1a365d] text-white py-3 rounded-xl font-semibold hover:bg-[#0f2440] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="text-sm text-[#FFC220] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
