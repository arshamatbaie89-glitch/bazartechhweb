# Bazartech - Premium Ecommerce Store

A bilingual (Arabic/English) ecommerce platform built with Next.js, featuring a full admin dashboard with 2FA authentication.

## Features

- **Product Catalog** — Browse, search, filter, and sort products with responsive grid layout
- **Shopping Cart & Wishlist** — Persistent cart/wishlist with localStorage
- **Admin Dashboard** — Manage products, orders, and analytics
- **2FA Authentication** — OTP-based two-factor authentication for admin login
- **Bilingual (i18n)** — Full Arabic/English support with RTL layout
- **Dark Mode** — Theme toggle with system preference detection
- **Mobile Responsive** — Bottom nav bar and collapsible admin sidebar on mobile
- **Security** — CSRF protection, rate limiting, origin/referer checks

## Tech Stack

| Layer    | Tech                              |
| -------- | --------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind v4 |
| Backend  | Next.js API Routes, Middleware     |
| Database | SQLite via Prisma ORM             |
| Auth     | JWT (HS256), OTP (SHA-256), bcrypt|
| i18n     | Custom client-side implementation   |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone <repo-url>
cd bazartech
npm install
```

### Database Setup

```bash
npx prisma db push
npx prisma db seed
```

### Environment Variables

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

Key variables:

| Variable                   | Description                         |
| -------------------------- | ----------------------------------- |
| `DATABASE_URL`             | SQLite database path                |
| `JWT_SECRET`               | Secret for JWT signing (min 32 chars) |
| `COOKIE_SECURE`            | `true` in production behind HTTPS   |
| `NEXT_PUBLIC_SITE_URL`     | Your production URL                 |

### Development

```bash
npm run dev
# or
.\start.bat
```

Open [http://localhost:3001](http://localhost:3001) (or [http://localhost:3000](http://localhost:3000) if port is free).

### Default Admin Credentials

> **Username:** `admin`  
> **Password:** `admin123`  
> **OTP:** Printed in the server console during login

**Change the default password immediately after first login.**

### Production Build

```bash
npm run build
npm start
```

Set `COOKIE_SECURE=true` and `NEXT_PUBLIC_SITE_URL` to your domain before deploying.

## Project Structure

```
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # API route handlers
│   ├── cart/               # Shopping cart page
│   ├── category/           # Category listing
│   ├── product/            # Product detail page
│   └── verify-otp/         # 2FA OTP verification
├── components/             # Shared React components
├── context/                # React contexts (cart, wishlist, theme, etc.)
├── lib/                    # Utilities (auth, csrf, otp, prisma, etc.)
├── prisma/                 # Database schema & seed
├── public/                 # Static assets
└── proxy.js                # Next.js middleware (security)
```

## API Endpoints

### Public
- `GET /api/products` — List products (paginated, filterable)
- `GET /api/products/[id]` — Product detail
- `GET /api/categories` — Category list
- `POST /api/orders` — Place order
- `POST /api/reviews/[productId]` — Submit review

### Auth
- `POST /api/auth/login` — Admin login (returns `requires2FA`)
- `POST /api/auth/verify-otp` — Verify OTP token
- `POST /api/auth/resend-otp` — Resend OTP (60s cooldown)

### Admin (requires JWT + CSRF)
- `GET/POST /api/admin/products` — Manage products
- `GET/PATCH /api/admin/orders` — Manage orders
- `GET /api/admin/analytics` — Sales analytics

## License

Private — all rights reserved.
