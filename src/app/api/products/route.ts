import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/store";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const q = searchParams.get("q")?.toLowerCase();
  const sort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";
  const includeUnpublished = searchParams.get("includeUnpublished") === "true";

  let products: any[] = [];
  let categories: any[] = [];
  let brands: any[] = [];

  // 1. Fetch live from Supabase PostgreSQL
  try {
    const supabase = getServiceSupabase();
    const { data: dbProducts, error: pErr } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)");

    if (!pErr && dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        brandId: p.brand_id,
        brandName: p.brand_name,
        categoryId: p.category_id,
        categoryName: p.category_name,
        shortDescription: p.short_description,
        description: p.description,
        basePrice: Number(p.base_price) || 0,
        mrp: Number(p.mrp) || 0,
        hsnCode: p.hsn_code,
        gstRate: Number(p.gst_rate) || 18,
        images: p.images || [],
        isFeatured: Boolean(p.is_featured),
        isActive: Boolean(p.is_active),
        warrantySummary: p.warranty_summary,
        rating: Number(p.rating) || 4.8,
        reviewCount: Number(p.review_count) || 12,
        variants: (p.variants || []).map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          sku: v.sku,
          barcode: v.barcode,
          color: v.color,
          colorCode: v.color_code,
          ram: v.ram,
          storage: v.storage,
          sellingPrice: Number(v.selling_price) || 0,
          mrp: Number(v.mrp) || 0,
          costPrice: Number(v.cost_price) || 0,
          stockQuantity: Number(v.stock_quantity) || 0,
          lowStockThreshold: Number(v.low_stock_threshold) || 5,
          isActive: Boolean(v.is_active),
        })),
        highlights: p.highlights || [],
        specifications: p.specifications || {},
        returnPolicy: p.return_policy,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } else {
      products = db.getProducts();
    }

    const { data: dbCats } = await supabase.from("categories").select("*");
    categories = dbCats && dbCats.length > 0 ? dbCats : db.getCategories();

    const { data: dbBrands } = await supabase.from("brands").select("*");
    brands = dbBrands && dbBrands.length > 0 ? dbBrands : db.getBrands();
  } catch {
    products = db.getProducts();
    categories = db.getCategories();
    brands = db.getBrands();
  }

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
        p.variants.some((v: any) => v.barcode?.includes(q) || v.sku?.toLowerCase().includes(q))
    );
  }

  if (inStockOnly) {
    products = products.filter((p) => p.variants.some((v: any) => v.stockQuantity > 0));
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

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      await supabase.from("products").upsert({
        id: newProduct.id,
        title: newProduct.title,
        slug: newProduct.slug,
        brand_id: newProduct.brandId,
        brand_name: newProduct.brandName,
        category_id: newProduct.categoryId,
        category_name: newProduct.categoryName,
        short_description: newProduct.shortDescription,
        description: newProduct.description,
        base_price: newProduct.basePrice,
        mrp: newProduct.mrp,
        hsn_code: newProduct.hsnCode,
        gst_rate: newProduct.gstRate,
        images: newProduct.images,
        is_featured: newProduct.isFeatured,
        is_active: newProduct.isActive,
        warranty_summary: newProduct.warrantySummary,
        rating: newProduct.rating,
        review_count: newProduct.reviewCount,
      });

      if (newProduct.variants && newProduct.variants.length > 0) {
        await supabase.from("product_variants").upsert(
          newProduct.variants.map((v) => ({
            id: v.id,
            product_id: newProduct.id,
            sku: v.sku,
            barcode: v.barcode || v.sku,
            color: v.color,
            color_code: v.colorCode,
            ram: v.ram,
            storage: v.storage,
            selling_price: v.sellingPrice,
            mrp: v.mrp,
            cost_price: v.costPrice,
            stock_quantity: v.stockQuantity,
            low_stock_threshold: v.lowStockThreshold,
            is_active: v.isActive,
          }))
        );
      }
    } catch (sbErr) {
      console.warn("[Products] Supabase insert warning:", sbErr);
    }

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

    // Sync to Supabase PostgreSQL
    try {
      const supabase = getServiceSupabase();
      const sbUpdate: any = {};
      if (updates.title) sbUpdate.title = updates.title;
      if (updates.basePrice !== undefined) sbUpdate.base_price = updates.basePrice;
      if (updates.mrp !== undefined) sbUpdate.mrp = updates.mrp;
      if (updates.isActive !== undefined) sbUpdate.is_active = updates.isActive;
      if (updates.images) sbUpdate.images = updates.images;
      if (updates.description) sbUpdate.description = updates.description;
      if (updates.shortDescription) sbUpdate.short_description = updates.shortDescription;
      if (updates.brandName) sbUpdate.brand_name = updates.brandName;
      if (updates.categoryName) sbUpdate.category_name = updates.categoryName;
      if (Object.keys(sbUpdate).length > 0) {
        sbUpdate.updated_at = new Date().toISOString();
        await supabase.from("products").update(sbUpdate).eq("id", id);
      }
    } catch (sbErr) {
      console.warn("[Products] Supabase update warning:", sbErr);
    }

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

    // Sync to Supabase PostgreSQL (Soft delete)
    try {
      const supabase = getServiceSupabase();
      await supabase.from("products").update({ is_active: false }).eq("id", id);
    } catch (sbErr) {
      console.warn("[Products] Supabase delete warning:", sbErr);
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
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
