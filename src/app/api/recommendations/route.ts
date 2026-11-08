import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const bundle = db.getFrequentlyBoughtTogether(productId);
      const product = db.getProductById(productId);
      const similar = db
        .getProducts()
        .filter((p) => p.isActive && p.id !== productId && p.categoryId === product?.categoryId)
        .slice(0, 4);

      return NextResponse.json({
        success: true,
        bundle,
        similar,
      });
    }

    // Default trending and best sellers
    const all = db.getProducts().filter((p) => p.isActive);
    const trending = all.filter((p) => p.isFeatured).slice(0, 4);
    const bestSellers = all.slice(0, 4);

    return NextResponse.json({
      success: true,
      trending,
      bestSellers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch recommendations" }, { status: 500 });
  }
}

