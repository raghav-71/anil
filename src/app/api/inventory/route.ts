import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET() {
  const movements = db.getInventoryMovements();
  const products = db.getProducts();

  // Consolidate current stock table
  const inventoryList = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productTitle: p.title,
      brandName: p.brandName,
      categoryName: p.categoryName,
      variantId: v.id,
      sku: v.sku,
      barcode: v.barcode,
      variantName: `${v.color || ""} ${v.storage || ""}`.trim() || "Standard",
      stockQuantity: v.stockQuantity,
      lowStockThreshold: v.lowStockThreshold,
      sellingPrice: v.sellingPrice,
      costPrice: v.costPrice,
      stockValue: v.stockQuantity * v.costPrice,
      isLowStock: v.stockQuantity <= v.lowStockThreshold && v.stockQuantity > 0,
      isOutOfStock: v.stockQuantity === 0,
    }))
  );

  return NextResponse.json({
    inventoryList,
    movements,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, quantityChange, type, notes, performedBy } = body;

    const success = db.adjustStock(
      variantId,
      Number(quantityChange),
      type,
      notes || "Manual stock adjustment",
      performedBy || "Admin"
    );

    if (!success) {
      return NextResponse.json({ error: "Stock adjustment failed. Insufficient stock or invalid variant ID." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

