import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import Image from "next/image"
import { ThemeProvider } from "@/context/ThemeContext"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { ToastProvider } from "@/context/ToastContext"
import { LanguageProvider } from "@/context/LanguageContext"
import ThemeToggle from "@/components/ThemeToggle"
import SearchBar from "@/components/SearchBar"
import LangToggle from "@/components/LangToggle"
import CartIcon from "./CartIcon"
import MobileNav from "@/components/MobileNav"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata = {
  title: "Bazartech - Premium Retail",
  description: "Discover amazing products at great prices across Oman",
}

const branches = [
  { name: "Al Mabilah", phone: "+968 2450 1001" },
  { name: "Amerat", phone: "+968 2450 1002" },
  { name: "Nizwa", phone: "+968 2450 1003" },
  { name: "Sohar", phone: "+968 2450 1004" },
  { name: "Jalan", phone: "+968 2450 1005" },
]

export default function RootLayout({ children }) {
  return (
    <html lang="ar" className={`${geistSans.variable} ${geistMono.variable}`} dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <div className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 border-b border-gray-200 dark:border-gray-800 transition-colors">
                  <header>
                    <div className="max-w-7xl mx-auto px-4">
                      <div className="h-16 flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 group">
                          <div className="w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                            <Image src="/logo.png" alt="Bazartech" width={32} height={32} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-xl font-bold tracking-tight">
                            <span className="text-[#FFC220]">Baza</span><span className="text-yellow-500">rtech</span>
                          </span>
                        </Link>
                        <div className="hidden md:flex flex-1 max-w-lg mx-4">
                          <SearchBar />
                        </div>
                        <nav className="flex items-center gap-2">
                          <LangToggle />
                          <Link href="/wishlist" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105 relative">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </Link>
                          <CartIcon />
                          <ThemeToggle />

                        </nav>
                      </div>
                      <div className="md:hidden pb-3">
                        <SearchBar />
                      </div>
                    </div>
                  </header>
                </div>
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <footer className="bg-gray-900 dark:bg-black text-gray-400 mt-auto transition-colors">
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                      <div>
                        <Link href="/" className="flex items-center gap-1.5 mb-3 group">
                          <div className="w-7 h-7 rounded overflow-hidden group-hover:scale-105 transition-transform">
                            <Image src="/logo.png" alt="Bazartech" width={28} height={28} className="object-cover w-full h-full" />
                          </div>
                          <span className="font-bold text-lg text-white">
                            <span className="text-[#FFC220]">Baza</span><span className="text-yellow-500">rtech</span>
                          </span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-4">Your premium retail destination — quality products, unbeatable prices, delivered to your doorstep.</p>
                        <div className="flex items-center gap-3">
                          <a href="https://www.instagram.com/bazartech.om" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-yellow-500 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110" aria-label="Instagram">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          </a>
                          <a href="https://wa.me/96897484837" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-yellow-500 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110" aria-label="WhatsApp">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </a>
                          <Link href="/adminlogin" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-yellow-500 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110" aria-label="Admin">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Quick Links</h4>
                        <div className="space-y-2 text-sm">
                          <Link href="/" className="block hover:text-white transition-colors">Home</Link>
                          <Link href="/category/all" className="block hover:text-white transition-colors">All Products</Link>
                          <Link href="/cart" className="block hover:text-white transition-colors">Cart</Link>
                          <Link href="/wishlist" className="block hover:text-white transition-colors">Wishlist</Link>
                          <Link href="/track-order" className="block hover:text-white transition-colors">Track Order</Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Our Branches</h4>
                        <div className="space-y-2 text-sm">
                          {branches.map((branch) => (
                            <div key={branch.name} className="flex justify-between gap-2">
                              <span>{branch.name}</span>
                              <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="text-gray-400 hover:text-yellow-400 transition-colors">{branch.phone}</a>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Contact Us</h4>
                        <div className="space-y-2 text-sm">
                          <p>Email: <a href="mailto:support@bazartech.com" className="hover:text-white transition-colors">support@bazartech.com</a></p>
                          <p>Phone: <a href="tel:+96824501000" className="hover:text-white transition-colors">+968 2450 1000</a></p>
                          <p className="mt-3 text-gray-500">Working Hours</p>
                          <p>Sat-Thu: 9AM - 10PM</p>
                          <p>Friday: 2PM - 10PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                      <p>&copy; {new Date().getFullYear()} Bazartech. All rights reserved.</p>
                      <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                      </div>
                    </div>
                  </div>
                </footer>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
        </LanguageProvider>
        <MobileNav />
      </body>
    </html>
  )
}
