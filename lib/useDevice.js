"use client"

import { useState, useEffect } from "react"

export function useDevice() {
  const [device, setDevice] = useState({ isMobile: false, isTablet: false, isDesktop: true })

  useEffect(() => {
    function check() {
      const w = window.innerWidth
      setDevice({
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
      })
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return device
}
