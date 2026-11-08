import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        popular: ["iPhone 16 Pro", "Galaxy S24 Ultra", "OnePlus 12", "GaN Charger", "AirPods Pro", "Nothing Phone"],
        products: [],
        categories: [],
        brands: [],
      });
    }

    const allProducts = db.getProducts().filter((p) => p.isActive);
    const allCategories = db.getCategories();
    const allBrands = db.getBrands();

    // 1. Matching categories
    const matchingCategories = allCategories
      .filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query))
      .slice(0, 3);

    // 2. Matching brands
    const matchingBrands = allBrands
      .filter((b) => b.name.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query))
      .slice(0, 3);

    // 3. Typo-tolerant substring / token search
    const tokens = query.split(/\s+/).filter(Boolean);
    const matchingProducts = allProducts
      .filter((p) => {
        const text = `${p.title} ${p.brandName} ${p.categoryName} ${p.shortDescription} ${p.variants.map((v) => `${v.sku} ${v.barcode} ${v.color || ""} ${v.storage || ""}`).join(" ")}`.toLowerCase();
        return tokens.every((tok) => text.includes(tok));
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        brand: p.brandName,
        category: p.categoryName,
        price: p.basePrice,
        mrp: p.mrp,
        image: p.images[0],
        rating: p.rating,
        stockAvailable: p.variants.reduce((acc, v) => acc + v.stockQuantity, 0),
      }))
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      query,
      products: matchingProducts,
      categories: matchingCategories,
      brands: matchingBrands,
      popular: ["iPhone 16 Pro", "Galaxy S24 Ultra", "OnePlus 12", "GaN Charger", "AirPods Pro"],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}

