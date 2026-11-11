import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try Supabase PostgreSQL first
  try {
    const supabase = getServiceSupabase();
    const { data: dbVariants, error } = await supabase
      .from("product_variants")
      .select("*, products(id, title, brand_name, category_name)");

    if (!error && dbVariants && dbVariants.length > 0) {
      const inventoryList = dbVariants.map((v: any) => ({
        productId: v.product_id,
        productTitle: v.products?.title || "Product",
        brandName: v.products?.brand_name || "General",
        categoryName: v.products?.category_name || "General",
        variantId: v.id,
        sku: v.sku,
        barcode: v.barcode,
        variantName: `${v.color || ""} ${v.storage || ""}`.trim() || "Standard",
        stockQuantity: Number(v.stock_quantity) || 0,
        lowStockThreshold: Number(v.low_stock_threshold) || 5,
        sellingPrice: Number(v.selling_price) || 0,
        costPrice: Number(v.cost_price) || 0,
        stockValue: (Number(v.stock_quantity) || 0) * (Number(v.cost_price) || Number(v.selling_price) * 0.8),
        isLowStock: (Number(v.stock_quantity) || 0) <= (Number(v.low_stock_threshold) || 5) && (Number(v.stock_quantity) || 0) > 0,
        isOutOfStock: (Number(v.stock_quantity) || 0) === 0,
      }));

      const { data: dbMovements } = await supabase
        .from("inventory_movements")
        .select("*")
        .order("created_at", { ascending: false });

      return NextResponse.json(
        {
          inventoryList,
          movements: dbMovements && dbMovements.length > 0 ? dbMovements : db.getInventoryMovements(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }
  } catch {
    // fallback
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
      performedBy || "Shop Owner"
    );

    if (!success) {
      return NextResponse.json(
        { error: "Stock adjustment failed. Insufficient stock or invalid variant ID." },
        { status: 400 }
      );
    }

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      await supabase.from("inventory_movements").insert([
        {
          variant_id: variantId,
          quantity_change: Number(quantityChange),
          movement_type: type || "manual_adjustment",
          notes: notes || "Manual stock adjustment",
          performed_by: performedBy || "Shop Owner",
        },
      ]);

      const targetVariant = db.getVariantById(variantId);
      if (targetVariant) {
        await supabase
          .from("product_variants")
          .update({ stock_quantity: targetVariant.variant.stockQuantity })
          .eq("id", variantId);
      }
    } catch (sbErr) {
      console.warn("[Inventory] Supabase adjust stock warning:", sbErr);
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
