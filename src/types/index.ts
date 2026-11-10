export type UserRole = "super_admin" | "manager" | "customer";

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  itemCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  isFeatured: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  title?: string;
  status?: string;
  color?: string;
  colorCode?: string;
  ram?: string;
  storage?: string;
  sellingPrice: number;
  mrp: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  mrp: number;
  hsnCode: string;
  gstRate: number; // e.g. 18.00
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  warrantySummary: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  totalStock?: number;
  modelNumber?: string;
  promotionalPrice?: number;
  highlights?: string[];
  specifications?: Record<string, string>;
  returnPolicy?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  paymentTerms: string;
  totalPurchases: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  variantId: string;
  productName: string;
  variantDetails: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceNo: string;
  purchaseDate: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  notes?: string;
  items: PurchaseItem[];
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  movementType: "online_sale" | "online_order" | "purchase_inward" | "adjustment_add" | "adjustment_reduce" | "damage" | "return_restock";
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  color?: string;
  storage?: string;
  ram?: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  stockAvailable: number;
  sku: string;
  barcode: string;
  gstRate: number;
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  variantDetails: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  image?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Order {
  id: string;
  orderNumber: string;
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
  pickupDetails?: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    estimatedReady: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemBreakdown {
  variantId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // AC-2026-0001
  invoiceType: "b2c" | "b2b";
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  customerAddress?: string;
  source: "online";
  orderId?: string;
  items: InvoiceItemBreakdown[];
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  paymentMethod: "cash" | "upi" | "card" | "split" | "razorpay" | "cod";
  amountReceived: number;
  changeReturned: number;
  cashierName?: string;
  createdAt: string;
}

export interface ShopSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  invoicePrefix: string;
  nextInvoiceSequence: number;
  thermalPrinterType?: "80mm" | "58mm";
  footerTerms: string;
  codEnabled: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  ownerNotificationEmail?: string;
  ownerWhatsAppNumber?: string;
  whatsappOrderAlertsEnabled?: boolean;
  emailOrderAlertsEnabled?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  date: string;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
}

export interface FrequentlyBoughtTogetherBundle {
  id: string;
  mainProductId: string;
  bundledProductIds: string[];
  discountPercent: number;
  title: string;
}

