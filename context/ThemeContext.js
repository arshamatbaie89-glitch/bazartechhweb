"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("bazartech-theme")
    if (stored === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  function toggle() {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem("bazartech-theme", next ? "dark" : "light")
      if (next) document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      return next
    })
  }

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
