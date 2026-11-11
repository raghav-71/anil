import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      stockValue: v.stockQuantity * (v.costPrice || v.sellingPrice * 0.8),
      isLowStock: v.stockQuantity <= v.lowStockThreshold && v.stockQuantity > 0,
      isOutOfStock: v.stockQuantity === 0,
    }))
  );

  return NextResponse.json(
    {
      inventoryList,
      movements,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      return NextResponse.json(
        { error: "Stock adjustment failed. Insufficient stock or invalid variant ID." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
