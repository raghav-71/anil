import fs from "fs";
import path from "path";
import {
  Product,
  ProductVariant,
  Category,
  Brand,
  Customer,
  Supplier,
  Purchase,
  InventoryMovement,
  Order,
  Invoice,
  ShopSettings,
  UserRole,
  Review,
  UserAddress,
} from "@/types";
import { generateInvoiceNumber, generateOrderNumber } from "../utils";
import { calculateGstInclusive } from "../tax-calculator";
import { getServiceSupabase } from "../supabase/client";
import importedCatalog from "./imported-catalog.json";

const CATALOG_FILE_PATH = path.join(process.cwd(), "src", "lib", "database", "imported-catalog.json");
const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "lib", "database", "orders.json");
const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "lib", "database", "settings.json");

// In-Memory Synchronized Store (Initial seed data mirroring the 34 tables)
class StoreDatabase {
  private categories: Category[] = [
    {
      id: "cat-smartphones",
      name: "Smartphones",
      slug: "smartphones",
      description: "Authentic 5G and 4G smartphones from Motorola, OPPO, Vivo, Realme, Redmi, POCO and itel",
      imageUrl: "/images/products/photos/moto-g37-power.png",
      isActive: true,
      itemCount: 15,
    },
    {
      id: "cat-keypad",
      name: "Keypad Phones",
      slug: "keypad-phones",
      description: "Reliable, durable feature phones with long-lasting battery life from Lava, Cellecor, Jio and itel",
      imageUrl: "/images/products/photos/lava-a3-torch.jpg",
      isActive: true,
      itemCount: 6,
    },
    {
      id: "cat-earbuds",
      name: "Earbuds",
      slug: "earbuds",
      description: "True Wireless Stereo (TWS) earbuds with deep bass and ENC from boAt, KDM and Morbi",
      imageUrl: "/images/products/photos/boat-airdopes-156-nirvana.webp",
      isActive: true,
      itemCount: 6,
    },
    {
      id: "cat-neckbands",
      name: "Neckbands",
      slug: "neckbands",
      description: "Ergonomic wireless neckbands for music and all-day calling from KDM and boAt",
      imageUrl: "/images/products/photos/kdm-evergreen.jpg",
      isActive: true,
      itemCount: 8,
    },
    {
      id: "cat-headphones",
      name: "Headphones",
      slug: "headphones",
      description: "Over-ear and on-ear wireless headphones with immersive sound from boAt and Zebronics",
      imageUrl: "/images/products/photos/boat-rockerz-425.png",
      isActive: true,
      itemCount: 3,
    },
  ];

  private brands: Brand[] = [
    { id: "b-motorola", name: "Motorola", slug: "motorola", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-oppo", name: "OPPO", slug: "oppo", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-vivo", name: "Vivo", slug: "vivo", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-realme", name: "Realme", slug: "realme", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-redmi", name: "Redmi", slug: "redmi", logoUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-poco", name: "POCO", slug: "poco", logoUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-itel", name: "itel", slug: "itel", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: false },
    { id: "b-lava", name: "Lava", slug: "lava", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: false },
    { id: "b-cellecor", name: "Cellecor", slug: "cellecor", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: false },
    { id: "b-jio", name: "Jio", slug: "jio", logoUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80", isFeatured: false },
    { id: "b-boat", name: "boAt", slug: "boat", logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-kdm", name: "KDM", slug: "kdm", logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80", isFeatured: true },
    { id: "b-morbi", name: "Morbi", slug: "morbi", logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80", isFeatured: false },
    { id: "b-zebronics", name: "Zebronics", slug: "zebronics", logoUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80", isFeatured: false },
  ];

  private lastCatalogMtime: number = 0;
  private lastOrdersMtime: number = 0;

  private products: Product[] = [];

  constructor() {
    this.products = this.loadProductsFromDisk();
    const diskOrders = this.loadOrdersFromDisk();
    this.orders = diskOrders;
    const diskSettings = this.loadSettingsFromDisk();
    if (diskSettings) {
      this.shopSettings = { ...this.shopSettings, ...diskSettings };
    } else {
      this.saveSettingsToDisk();
    }
  }

  private loadSettingsFromDisk(): Partial<ShopSettings> | null {
    try {
      if (fs.existsSync(SETTINGS_FILE_PATH)) {
        const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch (err) {
      console.error("[StoreDatabase] Error loading settings from disk:", err);
    }
    return null;
  }

  public saveSettingsToDisk(): boolean {
    try {
      const dir = path.dirname(SETTINGS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(this.shopSettings, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("[StoreDatabase] Failed to save settings to disk:", err);
      return false;
    }
  }

  private loadProductsFromDisk(): Product[] {
    try {
      if (fs.existsSync(CATALOG_FILE_PATH)) {
        const stat = fs.statSync(CATALOG_FILE_PATH);
        this.lastCatalogMtime = stat.mtimeMs;
        const raw = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("[StoreDatabase] Error loading catalog from disk:", err);
    }
    return [...(importedCatalog as unknown as Product[])];
  }

  public saveProductsToDisk(): boolean {
    try {
      const dir = path.dirname(CATALOG_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = JSON.stringify(this.products, null, 2);
      try {
        fs.writeFileSync(CATALOG_FILE_PATH, data, "utf-8");
      } catch (e: any) {
        if (e.code === "EBUSY" || e.code === "EPERM") {
          const tmpPath = `${CATALOG_FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
          fs.writeFileSync(tmpPath, data, "utf-8");
          try {
            fs.renameSync(tmpPath, CATALOG_FILE_PATH);
          } catch {
            // fallback
          }
        } else {
          throw e;
        }
      }
      if (fs.existsSync(CATALOG_FILE_PATH)) {
        this.lastCatalogMtime = fs.statSync(CATALOG_FILE_PATH).mtimeMs;
      }
      return true;
    } catch (err) {
      console.error("[StoreDatabase] Failed to save catalog to disk:", err);
      return false;
    }
  }

  private loadOrdersFromDisk(): Order[] {
    try {
      if (fs.existsSync(ORDERS_FILE_PATH)) {
        const stat = fs.statSync(ORDERS_FILE_PATH);
        this.lastOrdersMtime = stat.mtimeMs;
        const raw = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("[StoreDatabase] Error loading orders from disk:", err);
    }
    return [];
  }

  public saveOrdersToDisk(): boolean {
    try {
      const dir = path.dirname(ORDERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = JSON.stringify(this.orders, null, 2);
      try {
        fs.writeFileSync(ORDERS_FILE_PATH, data, "utf-8");
      } catch (e: any) {
        if (e.code === "EBUSY" || e.code === "EPERM") {
          const tmpPath = `${ORDERS_FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
          fs.writeFileSync(tmpPath, data, "utf-8");
          try {
            fs.renameSync(tmpPath, ORDERS_FILE_PATH);
          } catch {
            // fallback
          }
        } else {
          throw e;
        }
      }
      if (fs.existsSync(ORDERS_FILE_PATH)) {
        this.lastOrdersMtime = fs.statSync(ORDERS_FILE_PATH).mtimeMs;
      }
      return true;
    } catch (err) {
      console.error("[StoreDatabase] Failed to save orders to disk:", err);
      return false;
    }
  }

  private customers: Customer[] = [];
  private suppliers: Supplier[] = [];
  private purchases: Purchase[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private orders: Order[] = [];
  private invoices: Invoice[] = [];

  private shopSettings: ShopSettings = {
    storeName: "ANIL COMMUNICATION & ZEROX",
    tagline: "Premium Smartphones & High-Speed Accessories",
    phone: "+91 9380124254",
    email: "",
    address: "Near Canara Bank, Belagavi, Karnataka - 591103",
    city: "Belagavi",
    state: "Karnataka",
    pincode: "591103",
    gstin: "29CQWPK2582Q1ZC",
    invoicePrefix: "AC-2026",
    nextInvoiceSequence: 2,
    footerTerms: "Thank you for shopping with ANIL COMMUNICATION & ZEROX!\nGoods once sold carry manufacturer warranty.\nPlease preserve this invoice for warranty and claim services.",
    codEnabled: true,
    freeShippingThreshold: 999,
    standardShippingFee: 99,
  };

  private reviews: Review[] = [
    {
      id: "rev-1",
      productId: "prod-realme-16-pro",
      productName: "Realme 16 Pro",
      userName: "Vikramaditya Hegde",
      rating: 5,
      title: "Outstanding performance and flagship display",
      comment: "Purchased the Realme 16 Pro 8GB/256GB from ANIL COMMUNICATION & ZEROX. The display is ultra-smooth, cameras capture crisp details in daylight and night mode. Battery easily sails through 28 hours with fast charging.",
      isVerifiedPurchase: true,
      helpfulVotes: 34,
      date: "2026-10-24",
    },
    {
      id: "rev-2",
      productId: "prod-moto-g37-power",
      productName: "Moto G37 Power",
      userName: "Dr. Ananya Rao",
      rating: 5,
      title: "Massive battery life and clean stock Android",
      comment: "Delivered in pristine sealed condition with authentic GST tax invoice. Battery easily lasts 2 full days of heavy calling and streaming. Truly excellent service from ANIL COMMUNICATION & ZEROX.",
      isVerifiedPurchase: true,
      helpfulVotes: 19,
      date: "2026-10-29",
    },
    {
      id: "rev-3",
      productId: "prod-boat-airdopes-156-nirvana",
      productName: "boAt Airdopes 156 Nirvana",
      userName: "Rahul Narang",
      rating: 5,
      title: "Deep bass and clear call quality",
      comment: "ANC works great in traffic and outdoor environments. Instant Bluetooth pairing with my phone and the case charges rapidly.",
      isVerifiedPurchase: true,
      helpfulVotes: 28,
      date: "2026-11-01",
    },
    {
      id: "rev-4",
      productId: "prod-kdm-evergreen",
      productName: "KDM Evergreen",
      userName: "Gautam Shenoy",
      rating: 5,
      title: "Ergonomic neckband with phenomenal battery backup",
      comment: "Super comfortable for workouts and long driving shifts. Magnetic earbuds click securely when not in use.",
      isVerifiedPurchase: true,
      helpfulVotes: 15,
      date: "2026-11-03",
    },
    {
      id: "rev-5",
      productId: "prod-lava-a3-torch",
      productName: "Lava A3 Torch",
      userName: "Pooja Kulkarni",
      rating: 5,
      title: "Durable keypad phone with ultra-bright torch",
      comment: "Bought for my grandparents. Loud speaker, large tactile keypad, and battery lasts over a week on a single charge.",
      isVerifiedPurchase: true,
      helpfulVotes: 12,
      date: "2026-11-04",
    },
  ];

  private userAddresses: UserAddress[] = [
    {
      id: "addr-1",
      name: "Raghav Anil",
      phone: "+91 98450 12345",
      street: "Flat 402, Prestige Hermitage, MG Road",
      landmark: "Near Trinity Metro Station",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      type: "home",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Raghav Anil (Office)",
      phone: "+91 98450 12345",
      street: "Level 7, Brigade Gateway, Malleshwaram",
      landmark: "World Trade Center",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560055",
      type: "work",
      isDefault: false,
    },
  ];

  // --- QUERY & MUTATION METHODS ---

  public getCategories(): Category[] {
    return this.categories;
  }

  public getBrands(): Brand[] {
    return this.brands;
  }

  public getProducts(): Product[] {
    try {
      if (fs.existsSync(CATALOG_FILE_PATH)) {
        const stat = fs.statSync(CATALOG_FILE_PATH);
        if (stat.mtimeMs > this.lastCatalogMtime) {
          this.products = this.loadProductsFromDisk();
          this.lastCatalogMtime = stat.mtimeMs;
        }
      }
    } catch {
      // ignore
    }
    return this.products;
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug || p.id === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id || p.slug === id);
  }

  public getVariantById(variantId: string): { product: Product; variant: ProductVariant } | null {
    for (const p of this.products) {
      const v = p.variants.find((variant) => variant.id === variantId);
      if (v) return { product: p, variant: v };
    }
    return null;
  }

  public getVariantByBarcode(barcode: string): { product: Product; variant: ProductVariant } | null {
    const trimmed = barcode.trim();
    for (const p of this.products) {
      const v = p.variants.find((variant) => variant.barcode === trimmed || variant.sku === trimmed);
      if (v) return { product: p, variant: v };
    }
    return null;
  }

  public getCustomers(): Customer[] {
    return this.customers;
  }

  public addCustomer(customerData: Omit<Customer, "id" | "totalOrders" | "totalSpent" | "createdAt">): Customer {
    const existing = this.customers.find((c) => c.phone === customerData.phone.trim());
    if (existing) {
      Object.assign(existing, customerData);
      return existing;
    }
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    this.customers.unshift(newCust);
    return newCust;
  }

  public getSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public addSupplier(supplierData: Omit<Supplier, "id" | "totalPurchases" | "outstandingBalance" | "createdAt">): Supplier {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    this.suppliers.unshift(newSup);
    return newSup;
  }

  public getPurchases(): Purchase[] {
    return this.purchases;
  }

  public addPurchase(purchaseData: Omit<Purchase, "id" | "createdAt">): Purchase {
    const newPur: Purchase = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.purchases.unshift(newPur);

    // Atomically increment inventory for each purchased item
    for (const item of newPur.items) {
      const res = this.getVariantById(item.variantId);
      if (res) {
        const prev = res.variant.stockQuantity;
        res.variant.stockQuantity += item.quantity;
        this.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          variantId: res.variant.id,
          productName: res.product.title,
          variantTitle: `${res.variant.color || ""} ${res.variant.storage || ""}`.trim(),
          movementType: "purchase_inward",
          quantityChange: item.quantity,
          previousQuantity: prev,
          newQuantity: res.variant.stockQuantity,
          referenceId: newPur.id,
          notes: `Purchase from ${newPur.supplierName} (Bill #${newPur.purchaseInvoiceNo})`,
          performedBy: "Admin",
          createdAt: new Date().toISOString(),
        });
      }
    }

    return newPur;
  }

  public getInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  public adjustStock(
    variantId: string,
    quantityChange: number,
    type: "adjustment_add" | "adjustment_reduce" | "damage",
    notes: string,
    performedBy: string = "Admin"
  ): boolean {
    const match = this.getVariantById(variantId);
    if (!match) return false;

    const prev = match.variant.stockQuantity;
    const next = prev + quantityChange;
    if (next < 0) return false;

    match.variant.stockQuantity = next;
    // Recompute product totalStock
    match.product.totalStock = match.product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

    this.inventoryMovements.unshift({
      id: `mov-${Date.now()}`,
      variantId,
      productName: match.product.title,
      variantTitle: `${match.variant.color || ""} ${match.variant.storage || ""}`.trim(),
      movementType: type,
      quantityChange,
      previousQuantity: prev,
      newQuantity: next,
      notes,
      performedBy,
      createdAt: new Date().toISOString(),
    });

    this.saveProductsToDisk();
    return true;
  }

  /**
   * ATOMIC STOCK CHECKOUT & INVOICING FOR ONLINE ORDERS
   * Decrements stock concurrency-safely and generates GST tax invoice
   */
  public completePosSale(params: {
    items: { variantId: string; quantity: number; unitPrice: number; discountPercent?: number }[];
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    paymentMethod: "cash" | "upi" | "card" | "split";
    amountReceived: number;
    cashierName: string;
    isInterstate?: boolean;
  }): { success: boolean; invoice?: Invoice; error?: string } {
    // 1. Concurrency Check: Ensure all items have sufficient available stock
    for (const item of params.items) {
      const match = this.getVariantById(item.variantId);
      if (!match) {
        return { success: false, error: `Product variant ${item.variantId} not found.` };
      }
      if (match.variant.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${match.product.title} (${match.variant.color || ""} ${match.variant.storage || ""}). Available: ${match.variant.stockQuantity}, Requested: ${item.quantity}`,
        };
      }
    }

    // 2. Generate sequential invoice number
    const invSeq = this.shopSettings.nextInvoiceSequence++;
    const invoiceNumber = generateInvoiceNumber(invSeq, this.shopSettings.invoicePrefix);

    let subtotal = 0;
    let totalDiscount = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;
    let grandTotal = 0;

    const invoiceItems = params.items.map((cartItem) => {
      const { product, variant } = this.getVariantById(cartItem.variantId)!;
      const discountPct = cartItem.discountPercent || 0;
      const originalLineTotal = cartItem.unitPrice * cartItem.quantity;
      const discountAmount = originalLineTotal * (discountPct / 100);
      const discountedLineTotal = originalLineTotal - discountAmount;

      const gst = calculateGstInclusive(discountedLineTotal, product.gstRate || 18, params.isInterstate || false);

      subtotal += originalLineTotal;
      totalDiscount += discountAmount;
      cgstSum += gst.cgstAmount;
      sgstSum += gst.sgstAmount;
      igstSum += gst.igstAmount;
      grandTotal += discountedLineTotal;

      // 3. Atomically decrement stock
      const prevStock = variant.stockQuantity;
      variant.stockQuantity -= cartItem.quantity;

      this.inventoryMovements.unshift({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        variantId: variant.id,
        productName: product.title,
        variantTitle: `${variant.color || ""} ${variant.storage || ""}`.trim(),
        movementType: "online_order",
        quantityChange: -cartItem.quantity,
        previousQuantity: prevStock,
        newQuantity: variant.stockQuantity,
        referenceId: invoiceNumber,
        notes: `Invoice #${invoiceNumber}`,
        performedBy: params.cashierName || "System Fulfillment",
        createdAt: new Date().toISOString(),
      });

      return {
        variantId: variant.id,
        productName: `${product.title} (${variant.color || ""} ${variant.storage || ""})`.trim(),
        hsnCode: product.hsnCode || "85171300",
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        discount: discountAmount,
        taxableValue: gst.taxableAmount,
        cgstRate: gst.cgstRate,
        cgstAmount: gst.cgstAmount,
        sgstRate: gst.sgstRate,
        sgstAmount: gst.sgstAmount,
        igstRate: gst.igstRate,
        igstAmount: gst.igstAmount,
        total: discountedLineTotal,
      };
    });

    const changeReturned = Math.max(0, params.amountReceived - grandTotal);

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      invoiceType: params.customerGstin ? "b2b" : "b2c",
      customerName: params.customerName.trim() || "Online Customer",
      customerPhone: params.customerPhone.trim() || "N/A",
      customerGstin: params.customerGstin,
      source: "online",
      items: invoiceItems,
      subtotal,
      discountAmount: totalDiscount,
      cgstAmount: cgstSum,
      sgstAmount: sgstSum,
      igstAmount: igstSum,
      grandTotal,
      paymentMethod: params.paymentMethod,
      amountReceived: params.amountReceived,
      changeReturned,
      cashierName: params.cashierName || "System",
      createdAt: new Date().toISOString(),
    };

    this.invoices.unshift(invoice);

    // Update customer spending record if phone is provided
    if (params.customerPhone && params.customerPhone !== "N/A") {
      let cust = this.customers.find((c) => c.phone === params.customerPhone);
      if (!cust) {
        cust = this.addCustomer({
          name: params.customerName,
          phone: params.customerPhone,
          gstin: params.customerGstin,
        });
      }
      cust.totalOrders += 1;
      cust.totalSpent += grandTotal;
    }

    return { success: true, invoice };
  }

  /**
   * ATOMIC ONLINE ORDER CHECKOUT
   * Validates inputs, server-computes pricing, checks stock, decrements inventory safely, and creates verified Order record
   */
  public completeOnlineOrder(params: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
    fulfillmentType?: "delivery" | "pickup";
    items: { variantId: string; quantity: number }[];
    paymentMethod: "razorpay" | "cod";
    paymentId?: string;
    paymentStatus?: "pending" | "paid" | "failed" | "refunded";
    discountAmount?: number;
    couponCode?: string;
    idempotencyKey?: string;
  }): { success: boolean; order?: Order; error?: string } {
    // 1. Customer Information Validation
    if (!params.customerName || params.customerName.trim().length < 2) {
      return { success: false, error: "Please enter a valid customer legal name (at least 2 characters)." };
    }
    const cleanPhone = (params.customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit customer mobile phone number." };
    }
    if (params.fulfillmentType !== "pickup") {
      if (!params.shippingAddress?.street || !params.shippingAddress?.city || !params.shippingAddress?.pincode) {
        return { success: false, error: "Please provide street address, city, and 6-digit PIN code for doorstep delivery." };
      }
    }

    // 2. Idempotency Protection to prevent duplicate orders
    if (params.idempotencyKey) {
      const existing = this.orders.find((o) => o.idempotencyKey === params.idempotencyKey);
      if (existing) {
        return { success: true, order: existing };
      }
    }

    // 3. Cart & Stock Validation
    if (!params.items || !Array.isArray(params.items) || params.items.length === 0) {
      return { success: false, error: "Shopping bag cannot be empty." };
    }

    for (const item of params.items) {
      const match = this.getVariantById(item.variantId);
      if (!match) return { success: false, error: "Product variant not found in store database." };
      if (item.quantity <= 0) return { success: false, error: "Quantity must be greater than zero." };
      if (match.variant.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Sorry, ${match.product.title} has only ${match.variant.stockQuantity} unit(s) remaining in stock.`,
        };
      }
    }

    const orderNumber = generateOrderNumber();
    let subtotal = 0;
    let taxAmount = 0;

    // 4. Server-Side Price & Tax Calculation (Never trusting client prices)
    const orderItems = params.items.map((cartItem) => {
      const { product, variant } = this.getVariantById(cartItem.variantId)!;
      const lineTotal = variant.sellingPrice * cartItem.quantity;
      const gst = calculateGstInclusive(lineTotal, product.gstRate);

      subtotal += lineTotal;
      taxAmount += gst.totalTax;

      // Decrement stock atomically
      const prevStock = variant.stockQuantity;
      variant.stockQuantity -= cartItem.quantity;

      this.inventoryMovements.unshift({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        variantId: variant.id,
        productName: product.title,
        variantTitle: `${variant.color || ""} ${variant.storage || ""}`.trim(),
        movementType: "online_order",
        quantityChange: -cartItem.quantity,
        previousQuantity: prevStock,
        newQuantity: variant.stockQuantity,
        referenceId: orderNumber,
        notes: `Online Order #${orderNumber}`,
        performedBy: "Online Storefront",
        createdAt: new Date().toISOString(),
      });

      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        variantId: variant.id,
        productName: product.title,
        variantDetails: `${variant.color || ""} ${variant.storage || ""}`.trim(),
        quantity: cartItem.quantity,
        unitPrice: variant.sellingPrice,
        taxRate: product.gstRate,
        taxAmount: gst.totalTax,
        totalPrice: lineTotal,
        image: product.images[0],
      };
    });

    const isPickup = params.fulfillmentType === "pickup";
    const discountAmount = Math.max(0, params.discountAmount || 0);
    const taxableBasis = Math.max(0, subtotal - discountAmount);
    const shippingFee = isPickup
      ? 0
      : (taxableBasis >= this.shopSettings.freeShippingThreshold ? 0 : this.shopSettings.standardShippingFee);
    const grandTotal = taxableBasis + shippingFee;

    const pickupDetails = isPickup
      ? {
          storeName: "ANIL COMMUNICATION & ZEROX",
          storeAddress: "Near Canara Bank, Belagavi, Karnataka - 591103, India",
          storePhone: "+91 9380124254",
          estimatedReady: "Within 2 business hours (10:00 AM - 8:30 PM)",
        }
      : undefined;

    // For COD, payment is strictly 'pending' (unpaid until collected on doorstep)
    // For online gateway, 'paid' once verified
    const paymentStatus =
      params.paymentMethod === "cod"
        ? "pending"
        : (params.paymentStatus || "paid");

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: params.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: (params.customerEmail || "").trim(),
      shippingAddress: params.shippingAddress,
      fulfillmentType: params.fulfillmentType || "delivery",
      pickupDetails,
      items: orderItems,
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      grandTotal,
      paymentMethod: params.paymentMethod,
      paymentStatus,
      status: "confirmed",
      notes: params.couponCode ? `Coupon applied: ${params.couponCode}` : (isPickup ? "In-Store Pickup order placed" : "Website order placed"),
      idempotencyKey: params.idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(order);

    // Register / update customer record
    let cust = this.customers.find((c) => c.phone === cleanPhone);
    if (!cust) {
      cust = this.addCustomer({
        name: params.customerName.trim(),
        phone: cleanPhone,
        email: params.customerEmail,
        address: params.shippingAddress.street,
        city: params.shippingAddress.city,
        state: params.shippingAddress.state,
        pincode: params.shippingAddress.pincode,
      });
    }
    cust.totalOrders += 1;
    cust.totalSpent += grandTotal;

    this.saveProductsToDisk();
    this.saveOrdersToDisk();

    // Async sync to Supabase database if service client configured
    try {
      (async () => {
        try {
          const supabase = getServiceSupabase();
          await supabase.from("orders").insert([
            {
              id: order.id,
              order_number: order.orderNumber,
              customer_name: order.customerName,
              customer_phone: order.customerPhone,
              customer_email: order.customerEmail,
              shipping_address: order.shippingAddress,
              fulfillment_type: order.fulfillmentType,
              subtotal: order.subtotal,
              discount_amount: order.discountAmount,
              shipping_fee: order.shippingFee,
              tax_amount: order.taxAmount,
              grand_total: order.grandTotal,
              payment_method: order.paymentMethod,
              payment_status: order.paymentStatus,
              status: order.status,
              notes: order.notes,
              created_at: order.createdAt,
              updated_at: order.updatedAt,
            },
          ]);

          const dbItems = order.items.map((i) => ({
            order_id: order.id,
            variant_id: i.variantId,
            product_name: i.productName,
            variant_details: i.variantDetails,
            quantity: i.quantity,
            unit_price: i.unitPrice,
            tax_rate: i.taxRate,
            tax_amount: i.taxAmount,
            total_price: i.totalPrice,
            image: i.image,
          }));

          await supabase.from("order_items").insert(dbItems);
        } catch {
          // Supabase is optional; disk JSON is primary persistent store
        }
      })();
    } catch {
      // In-memory / disk persistence is guaranteed
    }

    return { success: true, order };
  }

  public markOrderPaymentPaid(orderId: string, transactionRef?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return false;
    order.paymentStatus = "paid";
    if (transactionRef) {
      order.notes = `${order.notes || ""} | Settled: ${transactionRef}`.trim();
    }
    order.updatedAt = new Date().toISOString();
    this.saveOrdersToDisk();
    return true;
  }

  public getOrders(): Order[] {
    try {
      if (fs.existsSync(ORDERS_FILE_PATH)) {
        const stat = fs.statSync(ORDERS_FILE_PATH);
        if (stat.mtimeMs > this.lastOrdersMtime) {
          const loaded = this.loadOrdersFromDisk();
          if (loaded.length > 0) this.orders = loaded;
          this.lastOrdersMtime = stat.mtimeMs;
        }
      }
    } catch {
      // ignore
    }
    return this.orders;
  }

  public getOrderByIdOrNumber(query: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.id === query || o.orderNumber.toLowerCase() === query.trim().toLowerCase()
    );
  }

  public updateOrderStatus(orderId: string, status: Order["status"], trackingNumber?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return false;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();
    this.saveOrdersToDisk();
    return true;
  }

  public cancelOrder(orderId: string, reason: string): { success: boolean; message: string } {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found." };
    if (order.status === "shipped" || order.status === "out_for_delivery" || order.status === "delivered") {
      return { success: false, message: "Order has already been dispatched and cannot be cancelled directly. Please initiate a return upon receipt." };
    }
    if (order.status === "cancelled") {
      return { success: false, message: "Order is already cancelled." };
    }

    order.status = "cancelled";
    order.notes = `Cancelled by customer: ${reason}`;
    order.updatedAt = new Date().toISOString();

    // Restock items atomically
    for (const item of order.items) {
      const match = this.getVariantById(item.variantId);
      if (match) {
        const prev = match.variant.stockQuantity;
        match.variant.stockQuantity += item.quantity;
        this.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          variantId: match.variant.id,
          productName: match.product.title,
          variantTitle: item.variantDetails,
          movementType: "return_restock",
          quantityChange: item.quantity,
          previousQuantity: prev,
          newQuantity: match.variant.stockQuantity,
          referenceId: order.orderNumber,
          notes: `Restocked via Cancellation of Order #${order.orderNumber}`,
          performedBy: "System (Auto-Restock)",
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.saveProductsToDisk();
    this.saveOrdersToDisk();
    return { success: true, message: `Order #${order.orderNumber} has been cancelled and items returned to stock.` };
  }

  public requestReturn(orderId: string, reason: string): { success: boolean; message: string } {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, message: "Order not found." };
    if (order.status !== "delivered") {
      return { success: false, message: "Returns can only be requested for delivered orders." };
    }

    order.status = "returned";
    order.notes = `Return requested: ${reason}`;
    order.updatedAt = new Date().toISOString();
    this.saveOrdersToDisk();
    return { success: true, message: `Return request for order #${order.orderNumber} has been logged. Our dispatch team will inspect and process replacement.` };
  }

  // --- REVIEWS SYSTEM ---
  public getReviews(productId?: string): Review[] {
    if (productId) {
      return this.reviews.filter((r) => r.productId === productId);
    }
    return this.reviews;
  }

  public addReview(reviewData: Omit<Review, "id" | "date" | "helpfulVotes">): Review {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      helpfulVotes: 0,
      date: new Date().toISOString().split("T")[0],
    };
    this.reviews.unshift(newRev);

    // Update product rating and review count
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      const prodReviews = this.reviews.filter((r) => r.productId === prod.id);
      const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    return newRev;
  }

  public voteReviewHelpful(reviewId: string): boolean {
    const r = this.reviews.find((rev) => rev.id === reviewId);
    if (!r) return false;
    r.helpfulVotes += 1;
    return true;
  }

  // --- USER ADDRESSES ---
  public getUserAddresses(): UserAddress[] {
    return this.userAddresses;
  }

  public addUserAddress(addressData: Omit<UserAddress, "id">): UserAddress {
    if (addressData.isDefault) {
      this.userAddresses.forEach((a) => (a.isDefault = false));
    }
    const newAddr: UserAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    this.userAddresses.push(newAddr);
    return newAddr;
  }

  public deleteUserAddress(id: string): boolean {
    const idx = this.userAddresses.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.userAddresses.splice(idx, 1);
    return true;
  }

  public setDefaultUserAddress(id: string): boolean {
    const target = this.userAddresses.find((a) => a.id === id);
    if (!target) return false;
    this.userAddresses.forEach((a) => (a.isDefault = a.id === id));
    return true;
  }

  // --- FREQUENTLY BOUGHT TOGETHER RECOMMENDATIONS ---
  public getFrequentlyBoughtTogether(productId: string) {
    const mainProduct = this.getProductById(productId);
    if (!mainProduct) return null;

    // Smart accessory bundle pairing
    let bundledIds: string[] = [];
    if (mainProduct.categoryId === "cat-smartphones") {
      // Find 2 top accessories: charger and case
      const charger = this.products.find((p) => p.categoryId === "cat-chargers");
      const caseItem = this.products.find((p) => p.categoryId === "cat-accessories");
      if (charger) bundledIds.push(charger.id);
      if (caseItem) bundledIds.push(caseItem.id);
    } else {
      // Find another accessory
      const others = this.products.filter((p) => p.id !== productId && p.categoryId !== "cat-smartphones").slice(0, 2);
      bundledIds = others.map((p) => p.id);
    }

    const bundledProducts = bundledIds
      .map((id) => this.getProductById(id))
      .filter((p): p is Product => Boolean(p));

    if (bundledProducts.length === 0) return null;

    const originalPrice = mainProduct.basePrice + bundledProducts.reduce((acc, p) => acc + p.basePrice, 0);
    const bundleDiscountPercent = 10; // 10% combo discount
    const bundlePrice = Math.round(originalPrice * (1 - bundleDiscountPercent / 100));

    return {
      mainProduct,
      bundledProducts,
      bundleDiscountPercent,
      originalPrice,
      bundlePrice,
      savings: originalPrice - bundlePrice,
    };
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((i) => i.id === id || i.invoiceNumber === id);
  }

  public getShopSettings(): ShopSettings {
    return this.shopSettings;
  }

  public updateShopSettings(updates: Partial<ShopSettings>): ShopSettings {
    Object.assign(this.shopSettings, updates);
    this.saveSettingsToDisk();
    return this.shopSettings;
  }

  public addProduct(product: Product): Product {
    if (!product.id) {
      product.id = `prod-${Date.now()}`;
    }
    if (!product.slug) {
      product.slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (!product.variants || product.variants.length === 0) {
      product.variants = [{
        id: `var-${product.id}-default`,
        productId: product.id,
        sku: `SKU-${Date.now()}`,
        barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        title: "Standard",
        mrp: product.mrp || product.basePrice,
        sellingPrice: product.basePrice,
        costPrice: Math.round(product.basePrice * 0.8),
        stockQuantity: product.totalStock || 10,
        lowStockThreshold: 3,
        isActive: true,
      }];
    } else {
      if (product.basePrice && product.variants[0]) {
        product.variants[0].sellingPrice = product.basePrice;
        if (product.mrp) product.variants[0].mrp = product.mrp;
      }
    }
    product.totalStock = product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    this.products.unshift(product);
    this.saveProductsToDisk();
    return product;
  }

  public updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const p = this.products.find((prod) => prod.id === productId || prod.slug === productId);
    if (!p) return null;

    if (updates.basePrice !== undefined && p.variants && p.variants.length > 0) {
      p.variants[0].sellingPrice = updates.basePrice;
    }
    if (updates.mrp !== undefined && p.variants && p.variants.length > 0) {
      p.variants[0].mrp = updates.mrp;
    }
    if (updates.variants && updates.variants.length > 0) {
      if (updates.variants[0].sellingPrice) {
        updates.basePrice = updates.variants[0].sellingPrice;
      }
      if (updates.variants[0].mrp) {
        updates.mrp = updates.variants[0].mrp;
      }
      updates.totalStock = updates.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);
    }

    Object.assign(p, updates);
    p.updatedAt = new Date().toISOString();
    this.saveProductsToDisk();
    return p;
  }

  public deleteProduct(productId: string): boolean {
    const idx = this.products.findIndex((prod) => prod.id === productId || prod.slug === productId);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    this.saveProductsToDisk();
    return true;
  }

  public addCategory(cat: Category): Category {
    this.categories.push(cat);
    return cat;
  }

  public addBrand(brand: Brand): Brand {
    this.brands.push(brand);
    return brand;
  }

  // --- ANALYTICS & REPORTS AGGREGATIONS ---
  public getAnalyticsSummary() {
    // 1. Total genuine online revenue (paid or delivered online customer orders)
    const paidOrders = this.orders.filter((o) => o.paymentStatus === "paid" || o.status === "delivered");
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.grandTotal, 0);

    // 2. Genuine today sales
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = paidOrders.filter((o) => o.createdAt && o.createdAt.startsWith(todayStr));
    const todaySales = todayOrders.reduce((acc, o) => acc + o.grandTotal, 0);

    // 3. Gross Profit = Total Revenue - Cost of Goods Sold (COGS)
    let cogs = 0;
    for (const ord of paidOrders) {
      for (const item of ord.items) {
        const v = this.getVariantById(item.variantId);
        if (v) cogs += v.variant.costPrice * item.quantity;
      }
    }
    const grossProfit = Math.max(0, totalRevenue - cogs);

    // 4. Real stock counts
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of this.products) {
      for (const v of p.variants) {
        totalStockUnits += v.stockQuantity;
        if (v.stockQuantity === 0) outOfStockCount++;
        else if (v.stockQuantity <= v.lowStockThreshold) lowStockCount++;
      }
    }

    return {
      todaySales,
      totalRevenue,
      cogs,
      grossProfit,
      profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0",
      totalOrders: this.orders.length,
      totalCustomers: this.customers.length,
      totalProducts: this.products.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
    };
  }
}

// Global Singleton Instance
declare global {
  // eslint-disable-next-line no-var
  var __storeDb: StoreDatabase | undefined;
}

export const db: StoreDatabase = globalThis.__storeDb || new StoreDatabase();
if (process.env.NODE_ENV !== "production") {
  globalThis.__storeDb = db;
}
