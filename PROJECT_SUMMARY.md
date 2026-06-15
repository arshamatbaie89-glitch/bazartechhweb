# Bazartech Ecommerce — Project Summary (for AI agents)

## Overview
Bilingual (Arabic/English) ecommerce store with admin dashboard, 2FA auth, dark mode, mobile-responsive. Built for Oman market.

## Tech Stack
- **Next.js 16.2.9** (Turbopack, App Router)
- **React 19**, **Tailwind CSS v4**
- **Prisma ORM 7.x** with **SQLite** (`file:./dev.db` in project root)
- **JWT** (HS256) + **bcrypt** + **SHA-256** (OTP)
- **Prisma v7 critical detail**: Schema files CANNOT contain `url` in `datasource`. The URL is set in `prisma.config.ts` (TypeScript, loaded by Prisma CLI)

## Authentication Flow
1. User enters credentials on `/adminlogin`
2. POST to `/api/auth/login` → bcrypt verify → create OTP session → return `{ requires2FA: true }`
3. OTP cookie (`otp_session`, httpOnly, 5min) set automatically
4. Redirect to `/verify-otp`
5. User enters 6-digit OTP → POST to `/api/auth/verify-otp`
6. SHA-256 hash verification, expiry (5min), attempts (3 max)
7. Success: JWT cookie (`admin_token`) + CSRF cookie (`csrf_token`) set, redirect to `/admin`

## Key Architecture Decisions
- **No server state library** (no React Query, SWR, etc.) — plain `fetch()`
- **CSRF**: 64-char hex token, validated via timing-safe comparison in middleware
- **Rate limiting**: In-memory (resets on restart), per-IP, tiered limits
- **OTP**: `crypto.getRandomValues()` for generation, SHA-256 for hashing
- **All uploads** go to `public/uploads/` (staticky served)
- **i18n**: Custom implementation via React Context + `lib/i18n.js`

## Database Schema (SQLite)
```
Product:           id, productId(unique), name, description, price, salePrice?, images[], videoUrls[], category, stock, rating, reviewCount, views, featured, createdAt, updatedAt
Admin:             id, username(unique), passwordHash, email, createdAt
OtpVerification:   id, adminId→Admin, sessionId(unique), otpHash, expiresAt, attempts, cooldownAt?, createdAt
Order:             id, productId, productName, price, customerName, customerPhone, customerAddress, quantity, items[], status, createdAt
Review:            id, productId, rating, comment, author, createdAt
```

## Key Files
- `proxy.js` — Middleware: rate limiting, CSRF, CSP, security headers, origin validation
- `lib/prisma.js` — PrismaClient singleton with `@prisma/adapter-better-sqlite3`
- `lib/auth.js` — JWT sign/verify, cookie helpers
- `lib/otp.js` — OTP generation (crypto.getRandomValues), SHA-256 hash, verify
- `lib/csrf.js` — CSRF token generation (64-char hex via crypto.getRandomValues)
- `lib/validation.js` — sanitize, allowlist, validateLength, validatePrice, safeError
- `lib/rateLimit.js` — In-memory rate limiter with cleanup interval
- `lib/api.js` — Client-side `apiFetch()` with auto CSRF header
- `prisma.config.ts` — Prisma v7 config (MANDATORY for this version — CLI reads it for URL)
- `prisma/schema.prisma` — Schema WITHOUT `url` field (Prisma v7 requirement)
- `page.js` — Homepage with AbortController timeout (15s) + cache-busting `_t` param

## Important Gotchas
1. **prisma.config.ts is REQUIRED** — Prisma v7 removed `url` from schema. The config file provides `DATABASE_URL` and seed command
2. **No `url` in schema.prisma** — Will error if added. Use `prisma.config.ts` instead
3. **better-sqlite3 native binary** — Incompatible with Vercel serverless. Must use VPS, Railway, Fly.io, or Docker
4. **`dotenv` dependency kept** — Needed by `prisma.config.ts` and `prisma/seed.js` for CLI usage
5. **Build requires internet** for Google Fonts (Geist). Offline builds will fail
6. **RTL is CSS-only** — `[dir="rtl"]` selectors in `globals.css`
7. **No error boundaries** — Client crashes will white-screen
8. **Two login endpoints** — `/api/auth/login` (new, with 2FA) and `/api/admin/login` (legacy, direct JWT)
9. **CSP header** added in proxy.js — Allows `'unsafe-inline'` for Next.js style injection
10. **HSTS only on HTTPS** — Conditional check for `x-forwarded-proto` or `https:` protocol
