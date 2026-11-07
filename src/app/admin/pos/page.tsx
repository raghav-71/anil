"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatCurrency, formatCurrencyExact, formatDate } from "@/lib/utils";
import { calculateGstInclusive } from "@/lib/tax-calculator";
import { numberToWordsIndian } from "@/lib/invoice-generator";
import { useAuth } from "@/lib/auth-context";
import { Product, ProductVariant, Customer, Invoice } from "@/types";
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  X,
  Phone,
  Layers,
  Percent,
  Clock,
} from "lucide-react";

interface POSItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  discountPercent: number;
}

export default function POSTerminalPage() {
  const { user } = useAuth();

  // Catalog & Inventory Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Active Bill State
  const [billItems, setBillItems] = useState<POSItem[]>([]);
  const [billDiscountPercent, setBillDiscountPercent] = useState<number>(0);

  // Parked / Held Carts
  interface ParkedCart {
    id: string;
    timestamp: string;
    customer: { name: string; phone: string; gstin?: string };
    items: POSItem[];
    discountPercent: number;
  }
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [showRecallModal, setShowRecallModal] = useState(false);

  const handleParkCart = () => {
    if (billItems.length === 0) return;
    const newPark: ParkedCart = {
      id: `park-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      customer: selectedCustomer,
      items: [...billItems],
      discountPercent: billDiscountPercent,
    };
    setParkedCarts((prev) => [newPark, ...prev]);
    setBillItems([]);
    setBillDiscountPercent(0);
    setSelectedCustomer({ name: "Walk-in Customer", phone: "N/A" });
    setAmountReceived("");
  };

  const handleRecallCart = (cart: ParkedCart) => {
    setBillItems(cart.items);
    setBillDiscountPercent(cart.discountPercent);
    setSelectedCustomer(cart.customer);
    setParkedCarts((prev) => prev.filter((c) => c.id !== cart.id));
    setShowRecallModal(false);
  };

  // Customer Management in POS
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    phone: string;
    gstin?: string;
  }>({
    name: "Walk-in Customer",
    phone: "N/A",
  });
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: "", phone: "", gstin: "" });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "split">("cash");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completed Invoice & Print Modal
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [printLayout, setPrintLayout] = useState<"thermal" | "a4">("thermal");

  // Load Products & Customers
  const loadData = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      });

    fetch("/api/reports")
      .then((res) => res.json())
      .then(() => {
        // Fetch customers list
      });
  };

  useEffect(() => {
    loadData();
    // Keep barcode input ready for USB scanners
    barcodeInputRef.current?.focus();
  }, []);

  // Filter Catalog Products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all" && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandName.toLowerCase().includes(q);
      const matchVariant = p.variants.some((v) => v.barcode.includes(q) || v.sku.toLowerCase().includes(q));
      if (!matchTitle && !matchBrand && !matchVariant) return false;
    }
    return true;
  });

  // Handle Instant Barcode Scanner Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    let found = false;
    for (const p of products) {
      const v = p.variants.find((variant) => variant.barcode === code || variant.sku === code);
      if (v) {
        addToBill(p, v);
        found = true;
        setBarcodeInput("");
        setErrorMsg(null);
        break;
      }
    }

    if (!found) {
      setErrorMsg(`No product found for barcode "${code}"`);
    }
  };

  // Add Item to Current Bill
  const addToBill = (product: Product, variant: ProductVariant) => {
    setErrorMsg(null);
    setBillItems((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stockQuantity) {
          setErrorMsg(`Cannot add more. Only ${variant.stockQuantity} units available.`);
          return prev;
        }
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (variant.stockQuantity <= 0) {
        setErrorMsg(`${product.title} is currently out of stock.`);
        return prev;
      }
      return [...prev, { product, variant, quantity: 1, discountPercent: 0 }];
    });
  };

  const updateItemQty = (variantId: string, qty: number) => {
    if (qty <= 0) {
      removeFromBill(variantId);
      return;
    }
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.variant.id === variantId) {
          const validQty = Math.min(qty, item.variant.stockQuantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromBill = (variantId: string) => {
    setBillItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const clearBill = () => {
    setBillItems([]);
    setBillDiscountPercent(0);
    setAmountReceived("");
    setErrorMsg(null);
  };

  // Bill Financial Totals Calculation
  let grossSubtotal = 0;
  let totalItemDiscounts = 0;

  billItems.forEach((item) => {
    const originalLine = item.variant.sellingPrice * item.quantity;
    const discountVal = originalLine * (item.discountPercent / 100);
    grossSubtotal += originalLine;
    totalItemDiscounts += discountVal;
  });

  const billDiscountAmount = (grossSubtotal - totalItemDiscounts) * (billDiscountPercent / 100);
  const totalDiscount = totalItemDiscounts + billDiscountAmount;
  const netPayable = Math.max(0, grossSubtotal - totalDiscount);

  // Estimate GST Component
  const gstBreakdown = calculateGstInclusive(netPayable, 18, false);

  const receivedNum = Number(amountReceived) || 0;
  const changeDue = Math.max(0, receivedNum - netPayable);

  // Quick Cash Fill Buttons
  const setCashTender = (val: number) => {
    setAmountReceived(String(val));
  };

  // Complete POS Sale
  const handleCompleteSale = async () => {
    if (billItems.length === 0) {
      setErrorMsg("Please add products to the bill.");
      return;
    }

    if (paymentMethod === "cash" && receivedNum < netPayable) {
      setErrorMsg(`Cash received (${formatCurrency(receivedNum)}) is less than total payable (${formatCurrency(netPayable)})`);
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const payload = {
        items: billItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: item.variant.sellingPrice,
          discountPercent: item.discountPercent || billDiscountPercent,
        })),
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerGstin: selectedCustomer.gstin,
        paymentMethod,
        amountReceived: paymentMethod === "cash" ? receivedNum : netPayable,
        cashierName: user?.name || "Anil Kumar (Admin)",
      };

      const deviceToken =
        localStorage.getItem("anil_device_token") || "tok_anil_shop_primary_pos_counter_2026_xyz982";

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Token": deviceToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "POS checkout failed.");

      // Set active invoice for printing
      setActiveInvoice(data.invoice);
      clearBill();
      loadData(); // Refresh product stock counts immediately!
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to finalize sale");
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Native Printer
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* POS Top Action Strip */}
      <header className="no-print h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">SUPERMARKET SPEED POS COUNTER</h1>
            <p className="text-[10px] text-emerald-400 font-mono">LIVE STOCK SYNC ACTIVE • BARCODE ENGINE READY</p>
          </div>
        </div>

        {/* Barcode Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 max-w-md w-full mx-4">
          <div className="relative w-full">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU (or press Enter)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Add
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Cashier:</span>
          <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {user?.name || "Anil Kumar"}
          </span>
        </div>
      </header>

      {/* ERROR ALERT STRIP */}
      {errorMsg && (
        <div className="no-print bg-red-950/80 border-b border-red-800 px-6 py-2 text-xs text-red-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN 2-PANE POS INTERFACE */}
      <div className="no-print flex-1 flex overflow-hidden">
        {/* LEFT PANE: Product Catalog & Touch Quick-Add Grid */}
        <div className="flex-1 flex flex-col border-r border-slate-800/80 bg-slate-950 overflow-hidden">
          {/* Search & Category Pills */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by name, brand, storage (e.g. iPhone, S24, 256GB)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Quick Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  selectedCategory === "all" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                    selectedCategory === c.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.flatMap((product) =>
              product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => addToBill(product, variant)}
                  disabled={variant.stockQuantity <= 0}
                  className="rounded-2xl p-3 bg-slate-900 border border-slate-800 hover:border-blue-500/60 disabled:opacity-30 text-left transition flex flex-col justify-between group shadow-xs hover:shadow-lg"
                >
                  <div>
                    <div className="h-24 w-full rounded-xl bg-slate-800/80 mb-2 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block truncate">
                      {product.brandName}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{product.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      {[variant.color, variant.storage, variant.ram].filter(Boolean).join(" • ") || "Standard"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5 truncate">
                      {variant.barcode}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">
                      {formatCurrency(variant.sellingPrice)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        variant.stockQuantity <= variant.lowStockThreshold
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      Qty: {variant.stockQuantity}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: Supermarket Billing Bill Drawer */}
        <div className="w-96 lg:w-[440px] flex flex-col bg-slate-900 border-l border-slate-800 flex-shrink-0">
          {/* Customer Selection Strip */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">{selectedCustomer.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedCustomer.phone}</span>
              </div>
            </div>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
            >
              Change / Add
            </button>
          </div>

          {/* Park & Recall Toolbar */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={handleParkCart}
              disabled={billItems.length === 0}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 font-semibold flex items-center gap-1.5 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hold / Park Bill</span>
            </button>
            {parkedCarts.length > 0 && (
              <button
                onClick={() => setShowRecallModal(true)}
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition"
              >
                <span>Recall Held Bill ({parkedCarts.length})</span>
              </button>
            )}
          </div>

          {/* Items in Current Bill */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {billItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Barcode className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                <p className="font-semibold text-slate-400">Bill is empty</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Scan a barcode or click any product from the catalog grid to add it to the current transaction.
                </p>
              </div>
            ) : (
              billItems.map((item) => (
                <div
                  key={item.variant.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white truncate">{item.product.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {[item.variant.color, item.variant.storage].filter(Boolean).join(" • ")}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500">Barcode: {item.variant.barcode}</p>
                    </div>
                    <button
                      onClick={() => removeFromBill(item.variant.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                    <span className="font-bold text-white text-sm">
                      {formatCurrency(item.variant.sellingPrice * item.quantity)}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-2 py-0.5 border border-slate-700">
                      <button
                        onClick={() => updateItemQty(item.variant.id, item.quantity - 1)}
                        className="hover:text-red-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQty(item.variant.id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stockQuantity}
                        className="hover:text-blue-400 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Calculation & Payment Options */}
          {billItems.length > 0 && (
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
              {/* Totals */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(grossSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>GST Included (CGST 9% + SGST 9%)</span>
                  <span>{formatCurrency(gstBreakdown.totalTax)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-blue-400">{formatCurrency(netPayable)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(["cash", "upi", "card", "split"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl font-bold uppercase text-[10px] transition ${
                      paymentMethod === method
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Cash Tender & Change Due Calculator */}
              {paymentMethod === "cash" && (
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cash Received:</span>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0"
                      className="w-28 text-right font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-sm"
                    />
                  </div>

                  {/* Preset denomination buttons */}
                  <div className="flex gap-1 justify-end">
                    {[500, 2000, Math.ceil(netPayable / 500) * 500].map((amt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCashTender(amt)}
                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-300 font-mono"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-baseline pt-1 border-t border-slate-700">
                    <span className="text-slate-400 font-semibold">Change to Return:</span>
                    <span className={`font-mono text-sm font-black ${changeDue > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      {formatCurrency(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearBill}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition"
                  title="Clear Bill"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? "Deducting Stock & Invoicing..." : `Pay ${formatCurrency(netPayable)}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Recall Parked Cart */}
      {showRecallModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Held / Parked Transactions ({parkedCarts.length})</span>
              </h3>
              <button onClick={() => setShowRecallModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5">
              {parkedCarts.map((pCart) => (
                <div
                  key={pCart.id}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{pCart.customer.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Held at {pCart.timestamp} • {pCart.items.length} items
                    </div>
                    <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                      {formatCurrency(
                        pCart.items.reduce((acc, i) => acc + i.variant.sellingPrice * i.quantity, 0)
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRecallCart(pCart)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setParkedCarts((prev) => prev.filter((c) => c.id !== pCart.id))}
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add / Select Customer */}
      {showAddCustomerModal && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Customer Details</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="9845012345"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">GSTIN (Optional for B2B Invoice)</label>
                <input
                  type="text"
                  value={newCustomerForm.gstin}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value.toUpperCase() })}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedCustomer({ name: "Walk-in Customer", phone: "N/A" });
                  setShowAddCustomerModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Reset to Walk-in
              </button>
              <button
                onClick={() => {
                  if (newCustomerForm.name && newCustomerForm.phone) {
                    setSelectedCustomer(newCustomerForm);
                    setShowAddCustomerModal(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED INVOICE & PRINT MODAL (Supports 80mm/58mm Thermal & Full A4 Layout) */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Invoice Generated Successfully: {activeInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setActiveInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Toggle Pill (Thermal vs A4) */}
            <div className="no-print flex items-center justify-between bg-slate-800 p-2 rounded-2xl">
              <div className="flex gap-2 text-xs font-semibold">
                <button
                  onClick={() => setPrintLayout("thermal")}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    printLayout === "thermal" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  80mm / 58mm Thermal Slip
                </button>
                <button
                  onClick={() => setPrintLayout("a4")}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    printLayout === "a4" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Standard A4 GST Tax Invoice
                </button>
              </div>

              <button
                onClick={triggerPrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/30 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill (Ctrl+P)</span>
              </button>
            </div>

            {/* PRINT AREA PREVIEW */}
            <div className="print-area bg-white text-black p-6 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto">
              {printLayout === "thermal" ? (
                /* 80mm / 58mm THERMAL RECEIPT LAYOUT */
                <div className="max-w-[320px] mx-auto font-mono text-[11px] leading-tight text-black space-y-2 text-center">
                  <div className="border-b border-dashed border-black pb-2 space-y-0.5">
                    <h2 className="text-sm font-black uppercase tracking-tight">ANIL COMMUNICATIONS</h2>
                    <p className="text-[10px]">Shop 14, MG Road, Bengaluru - 560001</p>
                    <p className="text-[10px]">Ph: +91 98765 43210 • GSTIN: 29AAAAA0000A1Z5</p>
                  </div>

                  <div className="text-left text-[10px] border-b border-dashed border-black pb-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Invoice: #{activeInvoice.invoiceNumber}</span>
                      <span>Date: {formatDate(activeInvoice.createdAt)}</span>
                    </div>
                    <div>Customer: {activeInvoice.customerName} ({activeInvoice.customerPhone})</div>
                    {activeInvoice.customerGstin && <div>Customer GSTIN: {activeInvoice.customerGstin}</div>}
                    <div>Cashier: {activeInvoice.cashierName}</div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left text-[10px] border-b border-dashed border-black pb-2">
                    <thead>
                      <tr className="border-b border-black font-bold">
                        <th className="py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dotted divide-gray-300">
                      {activeInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1 pr-1">{it.productName}</td>
                          <td className="text-center py-1">{it.quantity}</td>
                          <td className="text-right py-1">{formatCurrencyExact(it.unitPrice)}</td>
                          <td className="text-right py-1 font-bold">{formatCurrencyExact(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals & Tax breakdown */}
                  <div className="text-right text-[10px] space-y-0.5 border-b border-dashed border-black pb-2">
                    <div className="flex justify-between">
                      <span>Taxable Value:</span>
                      <span>{formatCurrencyExact(activeInvoice.items.reduce((acc, i) => acc + i.taxableValue, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (9%):</span>
                      <span>{formatCurrencyExact(activeInvoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9%):</span>
                      <span>{formatCurrencyExact(activeInvoice.sgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
                      <span>GRAND TOTAL:</span>
                      <span>{formatCurrencyExact(activeInvoice.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Payment Method:</span>
                      <span className="uppercase font-bold">{activeInvoice.paymentMethod}</span>
                    </div>
                    {activeInvoice.paymentMethod === "cash" && (
                      <>
                        <div className="flex justify-between">
                          <span>Amount Tendered:</span>
                          <span>{formatCurrencyExact(activeInvoice.amountReceived)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Change Returned:</span>
                          <span>{formatCurrencyExact(activeInvoice.changeReturned)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-center text-[9px] pt-1 space-y-0.5">
                    <p className="font-bold">Goods once sold carry manufacturer warranty.</p>
                    <p>Thank you for shopping with Anil Communications!</p>
                  </div>
                </div>
              ) : (
                /* STANDARD A4 GST TAX INVOICE LAYOUT */
                <div className="p-4 space-y-4 text-xs font-sans text-black">
                  {/* Shop Info Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">ANIL COMMUNICATIONS</h2>
                      <p className="text-xs text-slate-600">Shop No. 14, Main Electronics Market, MG Road, Bengaluru - 560001</p>
                      <p className="text-xs text-slate-600">Ph: +91 98765 43210 • Email: support@anilcommunications.com</p>
                      <p className="font-bold mt-1">GSTIN: 29AAAAA0000A1Z5</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                        TAX INVOICE
                      </span>
                      <p className="text-sm font-bold font-mono mt-2">Invoice #: {activeInvoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">Date: {formatDate(activeInvoice.createdAt)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Billed To (Customer):</span>
                      <p className="font-bold text-slate-900">{activeInvoice.customerName}</p>
                      <p className="text-slate-600">Phone: {activeInvoice.customerPhone}</p>
                      {activeInvoice.customerGstin && <p className="font-bold">GSTIN: {activeInvoice.customerGstin}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Transaction Details:</span>
                      <p className="font-bold uppercase text-slate-900">Payment: {activeInvoice.paymentMethod}</p>
                      <p className="text-slate-600">Cashier: {activeInvoice.cashierName}</p>
                    </div>
                  </div>

                  {/* A4 Items Table */}
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Item Description</th>
                        <th className="p-2 border-r border-slate-300 text-center">HSN</th>
                        <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                        <th className="p-2 border-r border-slate-300 text-right">Rate</th>
                        <th className="p-2 border-r border-slate-300 text-right">Taxable</th>
                        <th className="p-2 border-r border-slate-300 text-right">CGST (9%)</th>
                        <th className="p-2 border-r border-slate-300 text-right">SGST (9%)</th>
                        <th className="p-2 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-slate-200 font-medium">{item.productName}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{item.hsnCode}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">{item.quantity}</td>
                          <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.unitPrice)}</td>
                          <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.taxableValue)}</td>
                          <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.cgstAmount)}</td>
                          <td className="p-2 border-r border-slate-200 text-right">{formatCurrencyExact(item.sgstAmount)}</td>
                          <td className="p-2 text-right font-bold">{formatCurrencyExact(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Footer */}
                  <div className="flex justify-between items-start pt-2">
                    <div className="max-w-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Amount in Words:</span>
                      <p className="text-xs font-semibold italic text-slate-800">
                        {numberToWordsIndian(activeInvoice.grandTotal)}
                      </p>
                    </div>

                    <div className="w-64 space-y-1 text-right text-xs">
                      <div className="flex justify-between">
                        <span>Total CGST:</span>
                        <span>{formatCurrencyExact(activeInvoice.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total SGST:</span>
                        <span>{formatCurrencyExact(activeInvoice.sgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black border-t-2 border-slate-800 pt-1">
                        <span>GRAND TOTAL:</span>
                        <span>{formatCurrencyExact(activeInvoice.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Authorized Signature */}
                  <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                    <div>
                      <p className="font-bold text-slate-800">Terms & Conditions:</p>
                      <p>1. Warranty claims subject to manufacturer terms.</p>
                      <p>2. Physical damage or liquid spills not covered under standard warranty.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-40 border-b border-slate-400 mb-1" />
                      <span className="font-semibold text-slate-800">For Anil Communications</span>
                      <p className="text-[10px]">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

