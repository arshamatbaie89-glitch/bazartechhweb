<<<<<<< HEAD
# Bazartech — Premium Ecommerce Store

Bilingual (Arabic/English) ecommerce platform with admin dashboard, OTP 2FA authentication, dark mode, and mobile-responsive design.

Built with Next.js 16, Prisma ORM, and SQLite.

## Features

- **Bilingual (i18n)** — Full Arabic/English support with RTL layout
- **Product Catalog** — Grid listing, categories, search, pagination, sorting
- **Shopping Cart & Wishlist** — Persistent via localStorage
- **Admin Dashboard** — Manage products, orders, stock, quick lookup
- **2FA Authentication** — Password + OTP with SHA-256 hashing and rate limiting
- **Security** — CSRF protection, rate limiting, input sanitization, CSP headers
- **Dark Mode** — System-aware theme toggle with localStorage persistence
- **Mobile Responsive** — Bottom nav bar, collapsible admin sidebar, touch-friendly

## Tech Stack

| Category       | Tech                                                        |
|----------------|-------------------------------------------------------------|
| Framework      | [Next.js](https://nextjs.org) 16.2.9 (App Router, Turbopack)|
| UI             | [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) v4 |
| Database       | SQLite via [Prisma](https://prisma.io) ORM 7.x               |
| Auth           | JWT (HS256), bcrypt, SHA-256 OTP, CSRF tokens               |
| Deployment     | Any Node.js host (VPS, Railway, Fly.io, etc.)               |

## Prerequisites

- **Node.js 20+**
- **npm**

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/bazartech.git
cd bazartech

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to SQLite database
npx prisma db push

# 5. Seed with default admin + sample products
npm run seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite database path |
| `JWT_SECRET` | Yes | — | Min 32-char hex string for JWT signing |
| `COOKIE_SECURE` | No | `false` | Set `true` when serving over HTTPS |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public site URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | — | Instagram profile URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | — | WhatsApp business number |

### Generating JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database

```bash
# Push schema changes to DB
npx prisma db push

# Regenerate Prisma client after schema changes
npx prisma generate

# Seed database
npm run seed

# Open Prisma Studio (GUI database browser)
npx prisma studio
```

The SQLite database file (`dev.db`) is created in the project root.

## Default Admin Credentials

> **Username:** `admin`  
> **Password:** `admin123`  
> **OTP:** Printed in the server console during login

**⚠️ Change the default password immediately after first login.**

## Development

```bash
npm run dev        # Start dev server on port 3001
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Production Build

```bash
npm run build
npm run start
```

Before deploying:

```bash
# 1. Set COOKIE_SECURE=true in .env
# 2. Set NEXT_PUBLIC_SITE_URL to your domain
# 3. Generate a strong JWT_SECRET
# 4. Change the default admin password
```

## Deployment

### Compatible Platforms

This project uses SQLite, which requires a **persistent filesystem**. The following platforms support it:

| Platform | SQLite Support | Notes |
|----------|---------------|-------|
| **VPS** (DigitalOcean, Linode, Hetzner) | ✅ Full | Deploy with Docker or directly |
| **Railway** | ✅ Full | Persistent volume support |
| **Fly.io** | ✅ Full | Volume mounts |
| **Render** | ✅ Full | Persistent disk |
| **Vercel** | ❌ No | Serverless does not support SQLite |

### Deploying to a VPS with Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t bazartech .
docker run -d -p 3000:3000 -v ./data:/app bazartech
```

### ⚠️ SQLite & Vercel

**Vercel does not support SQLite** because serverless functions run on a read-only filesystem and `better-sqlite3` requires native binaries. If you need Vercel deployment, you must migrate to PostgreSQL. **This project does not include that migration.** See [Prisma Postgres migration guide](https://pris.ly/d/migrate-postgres) if needed.

## Project Structure

```
.
├── app/                       # Next.js App Router
│   ├── layout.js              # Root layout (providers, header, footer)
│   ├── page.js                # Homepage (featured + paginated products)
│   ├── globals.css            # Tailwind v4 + CSS vars + animations
│   ├── admin/                 # Admin dashboard (protected)
│   ├── adminlogin/            # Admin login page
│   ├── verify-otp/            # 2FA OTP verification page
│   ├── cart/                  # Shopping cart
│   ├── wishlist/              # Wishlist
│   ├── category/[slug]/       # Category product listing
│   ├── product/[id]/          # Product detail + order modal
│   └── api/                   # API route handlers
├── components/                # Shared React components
├── context/                   # React Context providers
├── lib/                       # Utilities (auth, CSRF, OTP, validation)
├── prisma/
│   ├── schema.prisma          # Database schema (SQLite)
│   └── seed.js                # Seed script
├── prisma.config.ts           # Prisma CLI configuration
├── proxy.js                   # Next.js middleware (security, rate limiting)
├── public/uploads/            # Product images
└── start.bat                  # Dev startup script (Windows)
```

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | Paginated product list. Query: `page`, `limit`, `sort`, `category`, `search` |
| GET | `/api/products/[id]` | Product detail by `productId` |
| GET | `/api/categories` | Category list |
| POST | `/api/orders` | Place an order |
| POST | `/api/orders/bulk` | Place a multi-item order |
| GET | `/api/reviews/[productId]` | Product reviews |
| POST | `/api/reviews/[productId]` | Submit a review |
| GET | `/api/search` | Search products. Query: `q` (query), `limit` |

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Admin login (returns `requires2FA`) |
| POST | `/api/auth/verify-otp` | Verify OTP, receives JWT + CSRF cookies |
| POST | `/api/auth/resend-otp` | Resend OTP (60s cooldown) |

### Admin Endpoints (requires JWT + CSRF)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/admin/products` | List / create products |
| GET/PUT/DELETE | `/api/admin/products/[id]` | Read / update / delete product |
| GET | `/api/admin/orders` | List orders |
| PUT | `/api/admin/orders/[id]` | Update order status |
| GET | `/api/admin/analytics` | Dashboard analytics |
| GET | `/api/admin/quick-lookup/[id]` | Quick product lookup by ID |
| POST | `/api/admin/login` | Legacy login (direct JWT, no 2FA) |
| POST | `/api/admin/logout` | Clear auth cookies |

## Security

- **CSRF**: 64-char random tokens, validated via timing-safe comparison
- **Rate Limiting**: Per-IP limits (200/min global, 5/min login, 60/min admin)
- **Content Security Policy**: Restrictive CSP headers on all responses
- **Input Validation**: Sanitization, allowlists, length limits on all user input
- **Cookie Security**: `httpOnly`, `SameSite=Strict`, optional `Secure` flag
- **OTP**: SHA-256 hashed, 5-minute expiry, 3-attempt lockout, 60s resend cooldown
- **JWT**: HS256 algorithm, 8-hour expiry, min 32-char secret

## License

Private — all rights reserved.
=======
# bazartechhweb
bazartechwebsite
>>>>>>> b6fc68fdd12e36c29dcc171862e6a868e15ad575
