import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const q = searchParams.get("q")?.toLowerCase();
  const sort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";
  const includeUnpublished = searchParams.get("includeUnpublished") === "true";

  let products = db.getProducts();

  // Public storefront should only see published/active products unless admin specifies includeUnpublished
  if (!includeUnpublished) {
    products = products.filter((p) => p.isActive);
  }

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
        p.variants.some((v) => v.barcode?.includes(q) || v.sku?.toLowerCase().includes(q))
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

  return NextResponse.json(
    {
      products,
      categories: db.getCategories(),
      brands: db.getBrands(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin authentication required to create products." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // Auto-create category if new
    if (body.categoryName) {
      const existingCat = db.getCategories().find(
        (c) => c.name.toLowerCase() === body.categoryName.toLowerCase() || c.id === body.categoryId
      );
      if (!existingCat) {
        const catSlug = body.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newCat = {
          id: body.categoryId || `cat-${catSlug}`,
          name: body.categoryName,
          slug: catSlug,
          description: `${body.categoryName} department`,
          isActive: true,
        };
        db.addCategory(newCat);
        body.categoryId = newCat.id;
      } else {
        body.categoryId = existingCat.id;
      }
    }

    // Auto-create brand if new
    if (body.brandName) {
      const existingBrand = db.getBrands().find(
        (b) => b.name.toLowerCase() === body.brandName.toLowerCase() || b.id === body.brandId
      );
      if (!existingBrand) {
        const brandSlug = body.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newBrand = {
          id: body.brandId || `b-${brandSlug}`,
          name: body.brandName,
          slug: brandSlug,
          isFeatured: false,
        };
        db.addBrand(newBrand);
        body.brandId = newBrand.id;
      } else {
        body.brandId = existingBrand.id;
      }
    }

    // Ensure slug
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    // Ensure ID
    if (!body.id) {
      body.id = `prod-${body.slug || Date.now()}`;
    }

    const newProduct = db.addProduct(body);
    return NextResponse.json(
      { success: true, product: newProduct },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin authentication required to modify products." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const updated = db.updateProduct(id, updates);
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(
      { success: true, product: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin authentication required to delete products." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    const ok = db.deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
