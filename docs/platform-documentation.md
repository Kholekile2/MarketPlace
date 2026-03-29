# SA Marketplace Platform - V1 Documentation

## Project Overview

SA Marketplace is a lean digital storefront and manual order management tool designed for young South African entrepreneurs who currently sell via social media (Instagram, TikTok, WhatsApp). The platform gives sellers a professional product listing page and a simple order tracker — nothing more. It does not process payments, generate contracts, provide financial services, act as a courier, or create tax invoices.

## V1 Design Principles

- **Legally safe**: No financial services, no contracts, no tax invoices, no escrow
- **No integrations**: No payment gateways, no SMS/email APIs, no courier APIs
- **Manual-first**: Order tracking and courier info are entered by the seller by hand
- **Storefront only**: Buyers browse products and submit an order request; the seller handles everything else directly

## Target Users & Business Context

- **Primary Users**: Young South African entrepreneurs selling clothing, sneakers, phones, and other goods
- **Current State**: Users advertise on social media platforms
- **Platform Goal**: Provide a shareable product page and order inbox without replacing existing social media channels
- **Currency**: All amounts in South African Rand (ZAR) format: "R 1,234.56"
- **Compliance**: POPIA (Protection of Personal Information Act) considerations

## Technology Stack

### Core Framework
- **Next.js 15.4.2** with App Router
- **TypeScript** for type safety
- **React 18** with latest hooks and patterns

### Styling & UI
- **Tailwind CSS** for responsive, mobile-first design
- **Lucide React** for consistent iconography

### Data Management
- **localStorage-based shared store** for client-side data persistence (`sa_marketplace_products`, `sa_marketplace_orders`)
- **Base64 encoding** for image storage (up to 5 images per product)
- **Prisma ORM** schema exists (SQLite dev / PostgreSQL prod) — not yet active; app still uses localStorage

### Notifications & UX
- **React Hot Toast** for user feedback
- **Modal-based interfaces** for enhanced UX
- **Mobile-optimized touch interfaces**

## Implemented Features

### 1. Platform Infrastructure ✅

#### Landing Page (`src/app/page.tsx`)
- Hero section: "Sell online. Manage orders professionally."
- Three-step explainer: Create your store → Share your link → Manage your orders
- Legal disclaimer: platform provides storefront and order tools only; no payments, financial services, courier, or legally binding contracts
- Links to register/login

#### Authentication System (`src/app/login/`, `src/app/register/`)
- Login and registration pages
- Session management

### 2. Business Dashboard ✅

#### Main Dashboard (`src/app/dashboard/page.tsx`)
- **Stats**: Total Products, Total Orders, Revenue (paid orders only)
- **Quick Actions**: Add Product, View Orders
- **Recent Orders**: Last 5 orders with status badges, loaded from localStorage

#### Navigation (`src/app/dashboard/layout.tsx`)
- Sidebar with four items: **Dashboard**, **Business Profile**, **Products**, **Orders**
- Responsive: collapsible sidebar on mobile

### 3. Order Management ✅

#### Orders Page (`src/app/dashboard/orders/page.tsx`)
- **Add Order manually**: customer name, phone, product, size, price, delivery address, notes
- **Order list** with status filter tabs: All / Pending / Confirmed / Shipped / Delivered
- **Status workflow**: Pending → Confirmed → Shipped → Delivered (+ Cancel)
- **Payment toggle**: Mark as Paid / Unpaid
- **Manual courier & tracking fields**: free-text `courierName` and `trackingNumber` inputs per order — seller fills these in after arranging delivery themselves
- **Receipt link**: opens the printable receipt page in a new tab

#### Receipt Page (`src/app/dashboard/orders/receipt/[id]/page.tsx`)
- Printable page labelled **"SALES RECEIPT — NOT A TAX INVOICE"**
- Shows: business name, receipt number, date, customer name & phone, product, size, total, paid/unpaid status, courier info (if set)
- Footer disclaimer: not a tax invoice, not a legally binding contract
- Print button (hidden when printing via CSS)

### 4. Product Management ✅

#### Products Page (`src/app/dashboard/products/page.tsx`)
- **Full CRUD**: add, edit, delete products
- **Multi-image upload**: up to 5 images per product, stored as base64
- **Image gallery modal**: full-screen viewing, prev/next navigation, thumbnail strip, image counter
- **Product fields**: name, description, price, original price (sale), category, sizes, stock quantity, tags, visibility toggle
- **Filter tabs**: All / Visible / Hidden / In Stock / Out of Stock
- **Storefront preview link**

#### Product Data Structure
```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  stockQuantity: number
  images: string[]   // Base64 encoded, max 5
  isVisible: boolean
  tags: string[]
}
```

### 5. Business Profile ✅

#### Profile Dashboard (`src/app/dashboard/business-profile/page.tsx`)
- Shows business name and shareable profile URL
- Incoming order list (orders with `pending` status)
- Order status actions: Confirm / Cancel (pending) → Mark Shipped (confirmed)
- Share Profile Link modal with example social media post copy
- Link to view the public storefront

### 6. Public Storefront ✅

#### Business Page (`src/app/business/[username]/page.tsx`)
- **Product catalog**: all visible, in-stock products with images, prices, sale prices, stock badges
- **Image gallery modal**: same gallery as dashboard
- **Order form modal**: customer fills in name, phone, delivery address, size (if applicable), notes — saved to localStorage orders
- **WhatsApp contact button**: direct link to seller's WhatsApp
- **Social media links**: Instagram and TikTok
- **How to Order section**: three-step plain-language instructions
- **Customer reviews**: static star ratings and comments (mock data in V1)
- No verified badges, no escrow language, no specific payment method or courier brand mentions

### 7. Shared Data Store ✅

#### Products Store (`src/utils/productsStore.ts`)
```typescript
getProducts(): Product[]
addProduct(data): void
updateProduct(id, data): void
deleteProduct(id): void
getSellerProducts(username): Product[]   // filters visible products only
```

#### Orders Store
- Key: `sa_marketplace_orders` in localStorage
- Shared between the public storefront (write) and the seller dashboard (read/write)

## Data Flow Architecture

### Product Management Flow
1. Seller adds product with images → Dashboard Products page
2. Images converted to base64 → stored in localStorage
3. Product saved to `sa_marketplace_products` key
4. Public storefront reads visible products for the seller's username

### Order Flow
1. Customer visits `/business/[username]`, browses products, submits order form
2. Order written to `sa_marketplace_orders` in localStorage (status: `pending`)
3. Seller opens Orders dashboard, sees the new order
4. Seller updates status manually: Confirm → Shipped → Delivered
5. Seller manually enters courier name and tracking number
6. Seller marks order as paid when payment is received
7. Seller prints a receipt from the receipt page

## Code Organisation

### App Router Structure
```
src/app/
├── page.tsx                              # Landing page
├── layout.tsx                            # Root layout (font, Toaster)
├── login/page.tsx                        # Login
├── register/page.tsx                     # Registration
├── dashboard/
│   ├── layout.tsx                        # Sidebar navigation
│   ├── page.tsx                          # Dashboard overview
│   ├── business-profile/page.tsx         # Profile & incoming orders
│   ├── orders/
│   │   ├── page.tsx                      # Order management
│   │   └── receipt/[id]/page.tsx         # Printable receipt
│   └── products/page.tsx                 # Product CRUD
└── business/[username]/
    └── page.tsx                          # Public storefront
```

### Utilities
```
src/utils/
└── productsStore.ts    # localStorage CRUD for products
```

## Key Implementation Patterns

### 1. Hydration-Safe Rendering
```typescript
// Price formatting — consistent on server and client
const formatPrice = (price: number): string =>
  price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// isClient guard for localStorage reads
const [isClient, setIsClient] = useState(false)
useEffect(() => { setIsClient(true) }, [])
```

### 2. Image Gallery Modal Pattern
```typescript
const [showImageGallery, setShowImageGallery] = useState(false)
const [galleryImages, setGalleryImages] = useState<string[]>([])
const [currentImageIndex, setCurrentImageIndex] = useState(0)
```
Used in both the dashboard products page and the public storefront.

### 3. Orders localStorage Pattern
```typescript
const ORDERS_KEY = 'sa_marketplace_orders'
const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
```

## Current Status

### ✅ Fully Working in V1
- Landing page with legal disclaimer
- User authentication (login / register)
- Dashboard overview with live stats from localStorage
- Product management — full CRUD, multi-image upload, gallery
- Order management — manual entry, status workflow, courier info, paid toggle
- Printable sales receipt (not a tax invoice)
- Public business storefront — product catalog, order form, WhatsApp button, reviews
- Business profile page — shareable link, incoming order review
- Mobile-responsive design throughout
- Toast notifications for all user actions

### ❌ Intentionally Not in V1
These features were scoped out to keep the platform legally safe and simple:

| Feature | Reason removed |
|---|---|
| Contracts & invoices | Legal liability — not a registered legal/tax service |
| SMS / email notifications | Requires third-party API integration and regulatory considerations |
| Payment gateway integration | Requires FSP licence and SARB compliance |
| Courier API integration (PAXI, RAM, etc.) | Out of scope — seller arranges delivery manually |
| Buyer verification / ID checks | POPIA / FICA compliance complexity |
| Escrow service | Requires financial services licence |
| Analytics dashboard | Not needed for V1 |
| Customer CRM | Not needed for V1 |
| Social media customer import | Not needed for V1 |

### 🔮 Possible V2 Additions (when compliance is in place)
- Real database (Prisma + PostgreSQL migration)
- Authenticated sessions with NextAuth.js
- SMS order confirmations (seller-to-customer via WhatsApp Business API)
- Real product reviews submitted by verified buyers
- Per-seller business profile stored in database
- Basic analytics (order counts, revenue chart)

## Technical Achievements

1. **Complete Image Management Workflow**: Upload → base64 storage → gallery viewing
2. **Manual Order Processing**: Full status workflow from pending to delivered, all entered by the seller
3. **Printable Sales Receipt**: Clean receipt page with clear "Not a Tax Invoice" labelling
4. **Mobile-First Experience**: Optimized for South African mobile users
5. **Type-Safe Development**: Full TypeScript implementation
6. **Hydration-Safe Rendering**: No SSR/client mismatch on price formatting or localStorage reads
7. **Legally Scoped**: No features that require financial, legal, or courier service licences

## Next Steps for V2

1. **Database migration**: Move from localStorage to Prisma + PostgreSQL
2. **Real auth**: NextAuth.js session-based authentication
3. **Per-seller profiles**: Store business name, WhatsApp, social links in database
4. **Real reviews**: Buyers submit reviews after confirmed delivery
5. **Basic analytics**: Revenue and order charts
6. **SEO**: Dynamic metadata per business profile page
7. **Performance**: Image compression before base64 storage

## Legal Disclaimer

> SA Marketplace provides digital storefront and order management tools only. It does not process payments, provide financial services, act as a courier, or generate legally binding contracts or tax invoices. All transactions and arrangements are made directly between buyers and sellers.
