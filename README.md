# Anil Communications – Premium Mobile Store & POS Billing Management System

An enterprise-ready, unified full-stack platform combining an **Apple & Nothing-inspired modern glassmorphic E-Commerce storefront** with a **supermarket-speed Point of Sale (POS) billing counter**, connected to a single centralized PostgreSQL database with concurrency-safe atomic inventory synchronization.

---

## 🌟 Key Capabilities & Features

### 1. 🌐 Public E-Commerce Storefront
- **Visual Design**: Apple Store & Nothing Technology-inspired glassmorphism (`backdrop-filter: blur()`, frosted glass panels, refined typography, responsive cards).
- **Product Catalog**: Live search, multi-field filtering by Category (Smartphones, Fast Chargers, Audio, Cases, Power Banks), Brand (Apple, Samsung, OnePlus, Nothing, Xiaomi, Sony, Anker), Price slider, and In-Stock switch.
- **Product Details**: Variant matrix (Color swatches, RAM/Storage variants), live stock availability at physical counter, transparent SKU & barcode indicators, PIN code delivery checker.
- **Shopping Cart & Checkout**: Slide-out cart drawer + dedicated `/cart` & `/checkout` with coupon discounts (`WELCOME500`, `ANIL5`), Indian GST tax breakdown (18%), Razorpay signature-verified online payments, and Cash on Delivery (COD).
- **Order Tracking**: `/track-order` with real-time multi-step progress (Confirmed → Invoiced → Shipped → Out for Delivery → Delivered).

### 2. 💻 Supermarket-Speed POS Terminal (`/admin/pos`)
- **Instant Barcode Scanner**: Auto-focused input listener supporting standard USB & Bluetooth 1D/2D barcode scanners with Enter-key auto-add.
- **Fast Product Grid**: Quick-touch category tabs with live stock badges.
- **Active Bill Drawer**: Quantity steppers, item-level discounts, customer selector (Walk-in or Quick-add customer with GSTIN).
- **Payment Engine**: Cash, UPI, Card, Split payment.
- **Cash Tender Calculator**: Enter amount tendered, calculates change to return automatically with quick denomination buttons (₹500, ₹2000).
- **Dual-Mode Invoice Printing**:
  - **80mm & 58mm Thermal Receipt** (formatted for ESC/POS roll printers with itemized lines, GST summary, and warranty terms).
  - **Standard A4 GST Tax Invoice** (includes Shop GSTIN, HSN codes, CGST 9%, SGST 9%, and Amount in Words in Indian numbering format).
- **Atomic Stock Reduction**: Decrements inventory in the unified database concurrently with zero race conditions.

### 3. 📊 Admin & Executive Dashboard (`/admin/dashboard`)
- **Real-Time Telemetry**: Today's Sales, Total Revenue, Gross Profit (computed against recorded purchase cost price, not dummy numbers), Profit Margin %, and Live Stock Units.
- **Analytics Charts**: Monthly Revenue & Net Profit area charts, and Payment Method distribution.
- **Inventory Ledger**: Stock inward adjustments, damaged goods write-offs, and full audit movements history.
- **Online Orders Dispatcher**: Update order status, assign courier tracking numbers (AWB).
- **Purchases & Suppliers**: Record supplier PO bills (which automatically increments available inventory).
- **Customer CRM**: Lifetime spending, contact directory, and GSTIN records.
- **Shop Settings**: Configure Store Name, Address, GSTIN, Invoice Prefix (`AC-2026`), and Thermal Printer width.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### 2. Running Locally
```bash
# Clone or navigate to the project directory
cd "d:\Anil Communications"

# Install dependencies (already completed)
npm install

# Start the development server
npm run dev
```

Visit the application:
- **Public Storefront**: [http://localhost:3000](http://localhost:3000)
- **POS Billing Terminal**: [http://localhost:3000/admin/pos](http://localhost:3000/admin/pos)
- **Executive Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **Staff Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔑 Pre-Configured Staff & Admin Credentials

| Role | Email | Password / PIN | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@anilcommunications.com` | `admin123` | Full access (Settings, Reports, POS, Inventory, Users) |
| **Store Manager** | `manager@anilcommunications.com` | `manager123` | Inventory, Orders, Purchases, Suppliers, Reports |
| **POS Cashier** | `cashier@anilcommunications.com` | `cashier123` | Supermarket POS Terminal, Billing, Invoices |

*(Quick 1-click role switcher buttons are available directly on the login screen for testing)*

---

## 🗄️ Database Schema & Migrations

The database migration file is located at:
`supabase/migrations/20261107_initial_schema.sql`

It contains all **34 normalized tables**, foreign keys, indexes, Row-Level Security (RLS) policies, and the concurrency-safe `atomic_decrement_stock` PL/pgSQL function.

