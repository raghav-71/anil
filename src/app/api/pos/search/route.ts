import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const barcode = searchParams.get("barcode")?.trim();

  // 1. Direct barcode scan match
  if (barcode) {
    const found = db.getVariantByBarcode(barcode);
    if (found) {
      return NextResponse.json({
        type: "exact_barcode",
        match: {
          product: found.product,
          variant: found.variant,
        },
      });
    }
  }

  // 2. Keyword Search
  const products = db.getProducts();
  const queryLower = q.toLowerCase();

  const results: {
    product: any;
    variant: any;
  }[] = [];

  for (const product of products) {
    for (const variant of product.variants) {
      const matchBarcode = variant.barcode.includes(q);
      const matchSku = variant.sku.toLowerCase().includes(queryLower);
      const matchTitle = product.title.toLowerCase().includes(queryLower);
      const matchBrand = product.brandName.toLowerCase().includes(queryLower);
      const matchColor = variant.color?.toLowerCase().includes(queryLower);
      const matchStorage = variant.storage?.toLowerCase().includes(queryLower);

      if (!q || matchBarcode || matchSku || matchTitle || matchBrand || matchColor || matchStorage) {
        results.push({ product, variant });
      }
    }
  }

  return NextResponse.json({ results });
}

