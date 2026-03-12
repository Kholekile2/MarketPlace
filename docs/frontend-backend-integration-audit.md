# Frontend-Backend Integration Audit

**Project:** SA Marketplace Platform  
**Date:** 2026-03-03  
**Auditor:** Senior Full-Stack Architect (AI — read-only pass)  
**Framework:** Next.js 15.4.2 · App Router · TypeScript · Prisma · Neon PostgreSQL · NextAuth.js  

---

## Table of Contents

1. [Frontend Data Source Verification](#1-frontend-data-source-verification)
2. [API Usage Verification](#2-api-usage-verification)
3. [Response Shape Validation](#3-response-shape-validation)
4. [Auth Flow Verification](#4-auth-flow-verification)
5. [Prisma Usage Verification](#5-prisma-usage-verification)
6. [Demo Mode Validation](#6-demo-mode-validation)
7. [Error Handling Validation](#7-error-handling-validation)
8. [Environment Validation](#8-environment-validation)
9. [Dead Code Detection](#9-dead-code-detection)
10. [Production Readiness Summary](#10-production-readiness-summary)

---

## 1. Frontend Data Source Verification

### localStorage Scan Results

| Search Term | Files Found | Status |
|---|---|---|
| `localStorage` | `src/utils/productsStore.ts` only | ✅ Removed |
| `sa_marketplace_products` | None in `src/` | ✅ Clean |
| `sa_marketplace_orders` | None in `src/` | ✅ Clean |

### Detail

**`src/utils/productsStore.ts`** — the last file that contained `localStorage` — has been migrated to a module-level in-memory store:

```typescript
// In-memory product store (transitional state before Prisma is active)
let productStore: Product[] = [...initialProducts]

export const getProducts = (): Product[] => productStore
export const setProducts = (products: Product[]): void => { productStore = products }
```

**No active UI component reads from or writes to localStorage.** Zero `sa_marketplace_products` or `sa_marketplace_orders` keys exist in any source file.

> **Note:** `productsStore.ts` itself is now dead code — nothing imports it. See §9.

**Verdict: No localStorage usage. NOT BLOCKING.**

---

## 2. API Usage Verification

All components that display or mutate data use proper `fetch()` calls to API routes. No component reads directly from Prisma, the filesystem, or any client-side store.

### Component → API Route Map

| Component | Route | Method | Purpose |
|---|---|---|---|
| `dashboard/page.tsx` | `/api/products` | GET | Load product count |
| `dashboard/page.tsx` | `/api/orders` | GET | Load order count + recent orders |
| `dashboard/products/page.tsx` | `/api/products` | GET | Load all products for seller |
| `dashboard/products/page.tsx` | `/api/products` | POST | Create new product |
| `dashboard/products/page.tsx` | `/api/products/[id]` | PUT | Update product (edit + visibility toggle) |
| `dashboard/products/page.tsx` | `/api/products/[id]` | DELETE | Delete product |
| `dashboard/orders/page.tsx` | `/api/orders` | GET | Load all orders for seller |
| `dashboard/orders/page.tsx` | `/api/orders/[id]` | PUT | Update status / paid / courier info |
| `dashboard/orders/page.tsx` | `/api/orders/manual` | POST | Manually add order from dashboard |
| `dashboard/orders/receipt/[id]/page.tsx` | `/api/orders/[id]` | GET | Load single order for receipt |
| `dashboard/business-profile/page.tsx` | `/api/user/profile` | GET | Load seller profile |
| `dashboard/business-profile/page.tsx` | `/api/user/profile` | PUT | Save profile changes |
| `business/[username]/page.tsx` | `/api/storefront/[username]` | GET | Load public storefront |
| `business/[username]/page.tsx` | `/api/orders` | POST | Customer submits order |

**All HTTP methods are correct.** GET for reads, POST for creates, PUT for updates, DELETE for deletes.

**Verdict: All frontend components are wired to API routes. ✅**

---

## 3. Response Shape Validation

All response shapes are consistent between what the API returns and what the frontend destructures.

### Shape Verification

| API Route | API Returns | Frontend Expects | Match |
|---|---|---|---|
| `GET /api/products` | `{ products }` | `data.products ?? []` | ✅ |
| `POST /api/products` | `{ product }` | `res.ok` check + reload | ✅ |
| `PUT /api/products/[id]` | `{ product }` | `res.ok` check + reload | ✅ |
| `DELETE /api/products/[id]` | `{ success: true }` | `res.ok` check + reload | ✅ |
| `GET /api/orders` | `{ orders }` | `data.orders ?? []` | ✅ |
| `POST /api/orders` | `{ order: { id } }` | `res.ok` check | ✅ |
| `PUT /api/orders/[id]` | `{ order }` | `{ order }` destructured | ✅ |
| `GET /api/orders/[id]` | `{ order, businessName }` | `data.order`, `data.businessName` | ✅ |
| `POST /api/orders/manual` | `{ order }` | `res.ok` check + reload | ✅ |
| `GET /api/storefront/[username]` | `{ business, products }` | `data.business`, `data.products` | ✅ |
| `GET /api/user/profile` | `{ user }` | `data.user` | ✅ |
| `PUT /api/user/profile` | `{ user }` | `data.user` | ✅ |

**No frontend component expects a raw array from any endpoint.** All routes return named objects.

### Minor Issue

`dashboard/orders/page.tsx` — `loadOrders` does not check `res.ok` before calling `res.json()`:

```typescript
// src/app/dashboard/orders/page.tsx (line ~73)
const res = await fetch('/api/orders')
const data = await res.json()
setOrders(data.orders ?? [])
```

If the API returns HTTP 401 or 503, `res.json()` still succeeds (returning `{ error: '...' }`), and `data.orders ?? []` correctly falls back to an empty array. The `catch` block handles network failures. **Functionally safe but not explicit.**

**Verdict: Response shapes aligned. ✅**

---

## 4. Auth Flow Verification

### Route Protection

| Layer | Implementation | Coverage |
|---|---|---|
| **Next.js Middleware** | `src/middleware.ts` → `next-auth/middleware` | `/dashboard/:path*` — all sub-routes |
| **API route guard** | `getServerSession(authOptions)` → 401 if missing | See table below |

### API Route Auth Guard Audit

| API Route | Auth Required | Guard Present | Notes |
|---|---|---|---|
| `GET /api/products` | Yes (seller data) | ✅ `getServerSession` + 401 | |
| `POST /api/products` | Yes | ✅ `getServerSession` + 401 | |
| `PUT /api/products/[id]` | Yes | ✅ `getServerSession` + 401 | Plus ownership check via `ensureOwner()` |
| `DELETE /api/products/[id]` | Yes | ✅ `getServerSession` + 401 | Plus ownership check via `ensureOwner()` |
| `GET /api/orders` | Yes (seller data) | ✅ `getServerSession` + 401 | |
| `PUT /api/orders/[id]` | Yes | ✅ `getServerSession` + 401 | Plus ownership check via `ensureOwner()` |
| `GET /api/orders/[id]` | Yes | ✅ `getServerSession` + 401 | Plus ownership check via `ensureOwner()` |
| `POST /api/orders/manual` | Yes | ✅ `getServerSession` + 401 | |
| `GET /api/user/profile` | Yes | ✅ `getServerSession` + 401 | |
| `PUT /api/user/profile` | Yes | ✅ `getServerSession` + 401 | |
| `POST /api/orders` | **No** (intentional) | 🟡 Public endpoint | Customer-facing storefront order submission — by design |
| `GET /api/storefront/[username]` | **No** (intentional) | 🟡 Public endpoint | Public storefront — by design |
| `POST /api/auth/register` | **No** (intentional) | 🟡 Registration endpoint | Pre-auth — correct |

### Ownership Enforcement

`ensureOwner()` is implemented in `products/[id]` and `orders/[id]` routes. It queries Prisma with both the entity ID AND the session's `sellerId`, ensuring cross-user access is impossible.

```typescript
// products/[id]/route.ts
async function ensureOwner(productId: string, sellerId: string) {
  return prisma.product.findFirst({ where: { id: productId, sellerId } })
}
```

### Risk: Dashboard Layout is Client-Side Only

`src/app/dashboard/layout.tsx` is marked `'use client'` and contains no server-side auth check. It relies entirely on `middleware.ts` for protection. This is correct under App Router conventions — the middleware runs on every `/dashboard/*` request at the edge.

**Verdict: Auth flow is correctly implemented. ✅**

---

## 5. Prisma Usage Verification

### Client Instantiation

`src/lib/prisma.ts` implements the standard Next.js singleton pattern to prevent connection exhaustion in development hot-reloads:

```typescript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

✅ No direct `pg` driver usage anywhere in the codebase.  
✅ All API routes import `{ prisma }` from `@/lib/prisma`.

### Schema Configuration

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ Provider is `postgresql` — no `sqlite` configuration.  
✅ URL is read from `env("DATABASE_URL")` — not hardcoded in the schema.

### Schema Models vs API Usage

| Prisma Model | Used in API Routes | Fields Match Usage |
|---|---|---|
| `User` | `register`, `auth`, `storefront`, `orders`, `user/profile` | ✅ All fields present: `id`, `email`, `passwordHash`, `name`, `username`, `phone`, `businessName`, `whatsapp`, `instagramHandle`, `tiktokHandle` |
| `Product` | `products`, `products/[id]`, `storefront` | ✅ All fields present: `id`, `name`, `description`, `price`, `originalPrice`, `category`, `sizes`, `stockQuantity`, `isVisible`, `images`, `sellerId` |
| `Order` | `orders`, `orders/[id]`, `orders/manual` | ✅ All fields present: `id`, `customerName`, `customerPhone`, `productName`, `size`, `price`, `deliveryAddress`, `status`, `paid`, `notes`, `courierName`, `trackingNumber`, `sellerId` |

**Verdict: Prisma is correctly configured and used. ✅**

---

## 6. Demo Mode Validation

### Architecture

The demo mode is a complete parallel data path, activated by checking `session.user.id === DEMO_USER_ID`.

| File | Demo Role |
|---|---|
| `src/lib/demo-data.ts` | Source of truth: `DEMO_USER_ID`, `DEMO_PROFILE`, `DEMO_PRODUCTS`, `DEMO_ORDERS` |
| `src/lib/auth.ts` | Short-circuits Prisma for `demo@samarketplace.co.za` / `demo1234` |
| `src/app/api/products/route.ts` | Returns `DEMO_PRODUCTS` for GET; returns fake product for POST |
| `src/app/api/products/[id]/route.ts` | Returns stub `{ id }` for PUT; `{ success: true }` for DELETE |
| `src/app/api/orders/route.ts` | Returns `DEMO_ORDERS` for GET; returns fake order for POST |
| `src/app/api/orders/[id]/route.ts` | Returns `DEMO_ORDERS.find(...)` for GET; merges data for PUT |
| `src/app/api/orders/manual/route.ts` | Returns fake order for POST |
| `src/app/api/user/profile/route.ts` | Returns `DEMO_PROFILE` for GET; returns merged data for PUT |
| `src/app/api/storefront/[username]/route.ts` | Returns hardcoded `DEMO_STORE` for `username === 'demo'` |

### Demo Isolation

Demo operations **never touch Prisma**. The `DEMO_USER_ID = 'demo'` check gates every write operation. Demo mutations (add product, update order) return synthetic in-memory responses without persisting anything.

### ⚠️ Risk: Demo Data Duplication

`src/app/api/storefront/[username]/route.ts` defines its own local `DEMO_STORE` constant with hardcoded product data:

```typescript
// storefront/[username]/route.ts — lines 4-50
const DEMO_STORE = {
  business: { ... },
  products: [ /* 3 products defined inline */ ],
}
```

This duplicates `DEMO_PRODUCTS` from `src/lib/demo-data.ts`. These two datasets are currently in sync but can diverge silently if either is updated independently.

**Verdict: Demo mode is correctly isolated from real users. One duplication risk. ⚠️**

---

## 7. Error Handling Validation

### Status Code Audit

| Route | 400 | 401 | 404 | 500 | 503 |
|---|---|---|---|---|---|
| `GET /api/products` | — | ✅ | — | — | ✅ |
| `POST /api/products` | ✅ Zod | ✅ | — | ✅ | — |
| `PUT /api/products/[id]` | ✅ Zod | ✅ | ✅ | ✅ | — |
| `DELETE /api/products/[id]` | — | ✅ | ✅ | ✅ | — |
| `GET /api/orders` | — | ✅ | — | — | ✅ |
| `POST /api/orders` | ✅ Zod | — | ✅ seller | ✅ | — |
| `PUT /api/orders/[id]` | ✅ Zod | ✅ | ✅ | ✅ | — |
| `GET /api/orders/[id]` | — | ✅ | ✅ | — | ✅ |
| `POST /api/orders/manual` | ✅ Zod | ✅ | — | ✅ | — |
| `GET /api/user/profile` | — | ✅ | ✅ | — | ✅ |
| `PUT /api/user/profile` | ✅ Zod | ✅ | — | ✅ | — |
| `GET /api/storefront/[username]` | — | — | ✅ | — | ✅ |
| `POST /api/auth/register` | ✅ Zod | — | — | ✅ | — |

### Zod Error Exposure

All routes that receive body data catch `z.ZodError` and return:

```json
{ "error": "Invalid input.", "details": [/* zod error array */] }
```

The `details` field exposes the Zod error array including `path`, `message`, and `code`. This leaks field names and validation rules to the caller. In a public-facing API (e.g. `POST /api/orders`) this may be acceptable, but note that full Zod error details in production could aid enumeration attacks.

### Stack Trace Leakage

All `catch` blocks use `console.error(...)` (server-side only) and return opaque messages like `"Database unavailable."` or `"Failed to create product."` to the client.

✅ No stack traces are ever included in API responses.

### Unhandled: `POST /api/products/[id]` does not exist

There is no `POST` handler on `src/app/api/products/[id]/route.ts`. Next.js will return a 405 automatically. This is correct — only `PUT` and `DELETE` are valid for this route.

**Verdict: Error handling is robust. Minor Zod detail leakage in public routes. ⚠️**

---

## 8. Environment Validation

### `.env.local` Contents

| Variable | Value | Status |
|---|---|---|
| `DATABASE_URL` | Live Neon PostgreSQL connection string with real credentials | 🔴 **CREDENTIAL IN FILE** |
| `DIRECT_URL` | Live Neon PostgreSQL direct URL with real credentials | 🔴 **CREDENTIAL IN FILE** |
| `NEXTAUTH_SECRET` | `"replace-me-with-a-long-random-string"` | 🔴 **PLACEHOLDER — BLOCKING** |
| `NEXTAUTH_URL` | `"http://localhost:3000"` | ⚠️ Must be changed for production |

### Critical Issues

**`NEXTAUTH_SECRET` is a placeholder.** NextAuth will use this to sign JWTs. A predictable/known secret in production allows arbitrary session token forgery. This **must** be replaced before any production deployment.

```bash
# Generate a proper secret:
openssl rand -base64 32
```

**Real database credentials are in `.env.local`.** Verify that `.gitignore` includes `.env.local`. If this file is ever committed, the Neon credentials must be rotated immediately.

### Source Code Credential Check

✅ No hardcoded credentials or connection strings exist in any `.ts` or `.tsx` file.  
✅ `src/lib/prisma.ts` uses `new PrismaClient()` without explicit `datasourceUrl` — it reads `DATABASE_URL` from the environment automatically.  
✅ No `.env` file is imported directly into any frontend component.  
✅ `DIRECT_URL` is present in `.env.local` but **not referenced** in `schema.prisma` — only `DATABASE_URL` is used. The `DIRECT_URL` variable is currently unused in code.

**Verdict: Source code is clean. Two critical environment issues. 🔴**

---

## 9. Dead Code Detection

### Unused Files

| File | Reason | Action |
|---|---|---|
| `src/utils/productsStore.ts` | No file imports it. All API routes use Prisma directly. The in-memory store has zero consumers. | **Delete** |

### Unused Dependencies (`package.json`)

| Package | Installed | Evidence of Use | Notes |
|---|---|---|---|
| `@next-auth/prisma-adapter` | ✅ | ❌ Not used in `src/lib/auth.ts` | `auth.ts` uses `CredentialsProvider` only; no Prisma adapter is configured |
| `@hookform/resolvers` | ✅ | ❌ Not found in any source file | All forms use raw `useState` |
| `react-hook-form` | ✅ | ❌ Not found in any source file | All forms use raw `useState` |
| `jspdf` | ✅ | ❌ Not found in any source file | Was presumably planned for PDF receipts |
| `qrcode` | ✅ | ❌ Not found in any source file | Was presumably planned for QR payment codes |
| `jsonwebtoken` | ✅ | ❌ Not found in any source file | NextAuth handles JWT internally |
| `date-fns` | ✅ | ❌ Not found in any source file | Likely planned for date formatting |
| `clsx` | ✅ | ❌ Not found in any source file | |
| `tailwind-merge` | ✅ | ❌ Not found in any source file | |

### Duplicate `formatPrice` Definition

`formatPrice` is independently defined in **5 separate files**:

| File | Line |
|---|---|
| `src/app/dashboard/products/page.tsx` | ~34 |
| `src/app/dashboard/orders/page.tsx` | ~26 |
| `src/app/dashboard/page.tsx` | ~7 |
| `src/app/dashboard/orders/receipt/[id]/page.tsx` | ~23 |
| `src/app/business/[username]/page.tsx` | ~42 |
| `src/app/dashboard/business-profile/page.tsx` | ~28 |

This should be extracted to a shared utility (e.g. `src/utils/format.ts`). One definition exists but none is shared.

### Unused Import in Auth

`src/lib/auth.ts` does not use the `@next-auth/prisma-adapter` despite it being installed. If session persistence to the database is needed in the future, this adapter would be required — but currently it adds bundle weight with no effect.

**Verdict: 1 dead file, 9 unused packages, 6 duplicate utility functions. ⚠️**

---

## 10. Production Readiness Summary

### ✅ What is Correctly Wired

- **Zero localStorage.** All client-side data flows through API routes.
- **All dashboard pages** use `fetch()` to the correct API routes with correct HTTP methods.
- **All API routes** are authenticated with `getServerSession(authOptions)`.
- **Ownership enforcement** implemented in all `[id]` mutation routes.
- **Prisma is correctly configured** with PostgreSQL, correct model definitions, and singleton instantiation.
- **Response shapes** are consistent between API and frontend for all 12 API routes.
- **Demo mode is isolated** — never touches Prisma, never pollutes real user data.
- **Error responses** are opaque (no stack trace leakage), with correct HTTP status codes.
- **Next.js middleware** protects all `/dashboard/*` routes at the edge.
- **Public routes** (`/api/storefront/[username]`, `POST /api/orders`) are correctly unguarded.

---

### ⚠️ What Needs Cleanup

| Issue | File | Priority |
|---|---|---|
| `productsStore.ts` is dead code | `src/utils/productsStore.ts` | Low |
| `DEMO_STORE` duplicates `DEMO_PRODUCTS` | `src/app/api/storefront/[username]/route.ts` | Medium |
| `formatPrice` duplicated in 6 files | Multiple dashboard files | Low |
| 9 unused `package.json` dependencies | `package.json` | Low |
| `DIRECT_URL` in `.env.local` not used in schema | `.env.local`, `prisma/schema.prisma` | Low |
| Zod error `details` exposed in public POST `/api/orders` | `src/app/api/orders/route.ts` | Low |
| `loadOrders()` doesn't check `res.ok` before parsing JSON | `src/app/dashboard/orders/page.tsx` | Low |
| `NEXTAUTH_URL` hardcoded to `localhost:3000` | `.env.local` | Must change for production |

---

### ❌ What Blocks Production

| Blocker | Location | Required Action |
|---|---|---|
| **`NEXTAUTH_SECRET` is a placeholder** | `.env.local` line 14 | Replace with `openssl rand -base64 32` output before any deployment |
| **Live Neon credentials in `.env.local`** | `.env.local` lines 10-11 | Verify `.env.local` is in `.gitignore`; rotate credentials if ever committed |

---

### 🧠 Architectural Risks

1. **Demo storefront data divergence.** `storefront/[username]/route.ts` maintains its own local `DEMO_STORE` object that duplicates `DEMO_PRODUCTS` and `DEMO_PROFILE` from `demo-data.ts`. If one is updated without the other, demo users will see inconsistent data across the dashboard and the storefront.

2. **In-memory data loss on server restart.** `productsStore.ts` (though currently dead) uses a module-level variable. In a multi-instance deployment (e.g. Vercel serverless), data in module-level variables is not shared across instances and is lost on cold starts. This is moot since the real API routes use Prisma, but shows why the file should be deleted.

3. **`@next-auth/prisma-adapter` installed but not configured.** NextAuth sessions are JWT-only (no database session persistence). This means sessions cannot be invalidated server-side (e.g. forced logout on password change). For a marketplace platform this may become a security consideration at scale.

4. **No rate limiting on any API route.** Public routes (`POST /api/orders`, `POST /api/auth/register`) have no rate limiting. At production traffic levels, these are vulnerable to spam and enumeration attacks.

5. **Base64 images stored in the database.** The `images: String[]` field on `Product` appears to store base64-encoded image data (frontend does `fileToBase64(file)` before sending). Storing large base64 strings in PostgreSQL is an anti-pattern: it bloats the database, slow queries, and is incompatible with CDN delivery. A file storage service (S3, Cloudflare R2, Supabase Storage) is the correct solution.

---

### 🚀 Final Readiness Verdict

```
Status: NOT READY FOR PRODUCTION
```

| Dimension | Status |
|---|---|
| Frontend → Backend wiring | ✅ Complete |
| localStorage removal | ✅ Complete |
| Authentication | ✅ Correct |
| Prisma / Database | ✅ Correct |
| Demo mode isolation | ✅ Correct |
| Error handling | ✅ Acceptable |
| `NEXTAUTH_SECRET` | 🔴 Placeholder — **MUST FIX** |
| Environment security | 🔴 Credentials in `.env.local` — verify `.gitignore` |
| Dead code cleanup | ⚠️ Minor |
| Image storage strategy | ⚠️ Base64 in DB is a scale risk |

**Two fixes are required before the first production deployment:**
1. Generate and set a real `NEXTAUTH_SECRET`.
2. Confirm `.env.local` is git-ignored and the Neon credentials have not been exposed.

All other issues are cleanup or architectural concerns for a V2 milestone.
