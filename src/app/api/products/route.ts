import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const q = searchParams.get("q")?.toLowerCase();
  const sort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";

  let products = db.getProducts();

  if (category && category !== "all") {
    products = products.filter((p) => p.categoryId === category || p.categoryName.toLowerCase() === category.toLowerCase());
  }

  if (brand && brand !== "all") {
    products = products.filter((p) => p.brandId === brand || p.brandName.toLowerCase() === brand.toLowerCase());
  }

  if (q) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.variants.some((v) => v.barcode.includes(q) || v.sku.toLowerCase().includes(q))
    );
  }

  if (inStockOnly) {
    products = products.filter((p) => p.variants.some((v) => v.stockQuantity > 0));
  }

  if (sort === "price-low") {
    products.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sort === "price-high") {
    products.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sort === "rating") {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === "newest") {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({
    products,
    categories: db.getCategories(),
    brands: db.getBrands(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProduct = db.addProduct(body);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const updated = db.updateProduct(id, updates);
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const ok = db.deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

