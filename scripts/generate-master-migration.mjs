import fs from "fs";
import path from "path";

const catalog = JSON.parse(fs.readFileSync("src/lib/database/imported-catalog.json", "utf8"));
const orders = JSON.parse(fs.readFileSync("src/lib/database/orders.json", "utf8"));
const settings = JSON.parse(fs.readFileSync("src/lib/database/settings.json", "utf8"));
const urlMap = JSON.parse(fs.readFileSync("src/lib/database/uploaded-image-urls.json", "utf8"));

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (!obj) return "'[]'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- ======================================================================================
-- MASTER PRODUCTION MIGRATION & SEED: ANIL COMMUNICATION & ZEROX
-- File: 20261111_master_database_schema_and_seed.sql
-- Single Source of Truth PostgreSQL Database Setup
-- Generated: ${new Date().toISOString()}
-- ======================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------------------------
-- 1. TABLE DEFINITIONS
-- --------------------------------------------------------------------------------------

-- 1.1 ROLES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand_id VARCHAR(100) REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100),
    category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    short_description TEXT,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    mrp NUMERIC(12, 2) NOT NULL DEFAULT 0,
    hsn_code VARCHAR(20) DEFAULT '85171300',
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,
    images JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    warranty_summary VARCHAR(255) DEFAULT '1 Year Official Brand Warranty',
    rating NUMERIC(3, 2) DEFAULT 4.8,
    review_count INT DEFAULT 12,
    highlights JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    return_policy VARCHAR(255) DEFAULT '7-Day Return / Replacement directly at our Belagavi outlet',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    color VARCHAR(100),
    color_code VARCHAR(30),
    ram VARCHAR(50),
    storage VARCHAR(50),
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    mrp NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address JSONB NOT NULL,
    fulfillment_type VARCHAR(50) DEFAULT 'delivery',
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    cgst_amount NUMERIC(12, 2) DEFAULT 0,
    sgst_amount NUMERIC(12, 2) DEFAULT 0,
    igst_amount NUMERIC(12, 2) DEFAULT 0,
    shipping_fee NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100),
    variant_id VARCHAR(100),
    product_title VARCHAR(255),
    product_name VARCHAR(255),
    variant_name VARCHAR(150),
    variant_details VARCHAR(255),
    sku VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 INVENTORY_MOVEMENTS
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id VARCHAR(100) REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_change INT NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    notes TEXT,
    performed_by VARCHAR(100) DEFAULT 'Shop Owner',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 SHOP_SETTINGS
CREATE TABLE IF NOT EXISTS shop_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'primary',
    store_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Belagavi',
    state VARCHAR(100) DEFAULT 'Karnataka',
    pincode VARCHAR(20) DEFAULT '591103',
    gstin VARCHAR(50),
    invoice_prefix VARCHAR(20) DEFAULT 'ACZ-',
    next_invoice_sequence INT DEFAULT 1001,
    cod_enabled BOOLEAN DEFAULT true,
    free_shipping_threshold NUMERIC(12, 2) DEFAULT 1000,
    standard_shipping_fee NUMERIC(12, 2) DEFAULT 99,
    owner_notification_email VARCHAR(100),
    owner_whatsapp_number VARCHAR(50),
    whatsapp_order_alerts_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.11 REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT true,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    landmark VARCHAR(150),
    type VARCHAR(30) DEFAULT 'home',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------------------------
-- 2. INDEXES FOR HIGH-CONCURRENCY PERFORMANCE
-- --------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- --------------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------------------------
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access on ALL tables (for Next.js API server handlers)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "service_role_full_%I" ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY "service_role_full_%I" ON %I FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'')', tbl, tbl);
    END LOOP;
END $$;

-- Public Read on Catalog Tables
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_brands" ON brands;
CREATE POLICY "public_read_brands" ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT USING (is_active = true OR (
    EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.auth_user_id = auth.uid() AND r.name = 'owner')
));

DROP POLICY IF EXISTS "public_read_active_variants" ON product_variants;
CREATE POLICY "public_read_active_variants" ON product_variants FOR SELECT USING (is_active = true OR (
    EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.auth_user_id = auth.uid() AND r.name = 'owner')
));

DROP POLICY IF EXISTS "public_read_shop_settings" ON shop_settings;
CREATE POLICY "public_read_shop_settings" ON shop_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);

-- Customer Orders Security: Customers can only view their own orders
DROP POLICY IF EXISTS "customer_read_own_orders" ON orders;
CREATE POLICY "customer_read_own_orders" ON orders FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.auth_user_id = auth.uid() AND r.name = 'owner')
);

DROP POLICY IF EXISTS "customer_read_own_order_items" ON order_items;
CREATE POLICY "customer_read_own_order_items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p JOIN roles r ON p.role_id = r.id WHERE p.auth_user_id = auth.uid() AND r.name = 'owner'
    )))
);

-- --------------------------------------------------------------------------------------
-- 4. SEED DATA (ZERO DATA LOSS MIGRATION)
-- --------------------------------------------------------------------------------------

-- 4.1 ROLES
INSERT INTO roles (name, description) VALUES
    ('owner', 'Sole Store Owner with unrestricted catalog, financial and administrative authority'),
    ('customer', 'Verified Store Customer with shopping and self-account access only')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 4.2 CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, is_active, sort_order) VALUES
    ('cat-smartphones', 'Smartphones', 'smartphones', 'Authentic 5G and 4G smartphones from Motorola, OPPO, Vivo, Realme, Redmi, POCO and itel', 'https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/moto-g37-power.png', true, 1),
    ('cat-keypad', 'Keypad Phones', 'keypad-phones', 'Reliable, durable feature phones with long-lasting battery life from Lava, Cellecor, Jio and itel', 'https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/lava-a3-torch.jpg', true, 2),
    ('cat-earbuds', 'Earbuds', 'earbuds', 'True Wireless Stereo (TWS) earbuds with deep bass and ENC from boAt, KDM and Morbi', 'https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-airdopes-156-nirvana.webp', true, 3),
    ('cat-neckbands', 'Neckbands', 'neckbands', 'Ergonomic wireless neckbands for music and all-day calling from KDM and boAt', 'https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-evergreen.jpg', true, 4),
    ('cat-headphones', 'Headphones', 'headphones', 'Over-ear and on-ear wireless headphones with immersive sound from boAt and Zebronics', 'https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-rockerz-425.png', true, 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

-- 4.3 BRANDS
INSERT INTO brands (id, name, slug, logo_url, is_featured) VALUES
    ('b-motorola', 'Motorola', 'motorola', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
    ('b-oppo', 'OPPO', 'oppo', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
    ('b-vivo', 'Vivo', 'vivo', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
    ('b-realme', 'Realme', 'realme', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
    ('b-redmi', 'Redmi', 'redmi', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80', true),
    ('b-poco', 'POCO', 'poco', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80', true),
    ('b-itel', 'itel', 'itel', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
    ('b-lava', 'Lava', 'lava', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
    ('b-cellecor', 'Cellecor', 'cellecor', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
    ('b-jio', 'Jio', 'jio', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
    ('b-boat', 'boAt', 'boat', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', true),
    ('b-kdm', 'KDM', 'kdm', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', true),
    ('b-morbi', 'Morbi', 'morbi', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', false),
    ('b-zebronics', 'Zebronics', 'zebronics', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80', false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    logo_url = EXCLUDED.logo_url,
    is_featured = EXCLUDED.is_featured;

-- 4.4 SHOP SETTINGS
INSERT INTO shop_settings (
    id, store_name, tagline, phone, email, address, city, state, pincode, gstin,
    invoice_prefix, next_invoice_sequence, cod_enabled, free_shipping_threshold,
    standard_shipping_fee, owner_whatsapp_number
) VALUES (
    'primary',
    ${escapeSql(settings.storeName || "ANIL COMMUNICATION & ZEROX")},
    ${escapeSql(settings.tagline || "Premium Smartphones & Accessories")},
    ${escapeSql(settings.phone || "+91 9380124254")},
    ${escapeSql(settings.email || "admin@anilcommunications.com")},
    ${escapeSql(settings.address || "Bagalkot Main Road, Pant Nagar, Near Canara Bank, 591103, Karnataka, India")},
    'Belagavi', 'Karnataka', '591103',
    ${escapeSql(settings.gstin || "29AAAAA0000A1Z5")},
    'ACZ-', 1001, true, 1000, 99, '919380124254'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address;
\n`;

// 4.5 PRODUCTS SEED
sql += `-- 4.5 INSERT 36 CATALOG PRODUCTS WITH CDN STORAGE IMAGES\n`;
catalog.forEach((p) => {
  // Map images to Supabase Storage CDN URLs
  const cdnImages = (p.images || []).map((img) => {
    const filename = path.basename(img);
    if (urlMap[filename]) return urlMap[filename];
    if (urlMap[`svg_${filename}`]) return urlMap[`svg_${filename}`];
    return img;
  });

  sql += `INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    ${escapeSql(p.id)},
    ${escapeSql(p.title)},
    ${escapeSql(p.slug)},
    ${escapeSql(p.brandId)},
    ${escapeSql(p.brandName)},
    ${escapeSql(p.categoryId)},
    ${escapeSql(p.categoryName)},
    ${escapeSql(p.shortDescription || p.description || p.title)},
    ${escapeSql(p.description || p.shortDescription || p.title)},
    ${Number(p.basePrice) || 0},
    ${Number(p.mrp) || Number(p.basePrice) || 0},
    ${escapeSql(p.hsnCode || "85171300")},
    ${Number(p.gstRate) || 18},
    ${escapeJson(cdnImages)},
    ${Boolean(p.isFeatured)},
    ${Boolean(p.isActive !== false)},
    ${escapeSql(p.warrantySummary || "1 Year Official Brand Warranty")},
    ${Number(p.rating) || 4.8},
    ${Number(p.reviewCount) || 12},
    ${escapeJson(p.highlights || [])},
    ${escapeJson(p.specifications || {})},
    ${escapeSql(p.returnPolicy || "7-Day Return / Replacement directly at our Belagavi outlet")}
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;\n\n`;
});

// 4.6 PRODUCT VARIANTS SEED
sql += `-- 4.6 INSERT 40 PRODUCT VARIANTS\n`;
catalog.forEach((p) => {
  if (p.variants && p.variants.length > 0) {
    p.variants.forEach((v) => {
      sql += `INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    ${escapeSql(v.id)},
    ${escapeSql(p.id)},
    ${escapeSql(v.sku)},
    ${escapeSql(v.barcode || v.sku)},
    ${escapeSql(v.color || "Standard")},
    ${escapeSql(v.colorCode || "#000000")},
    ${escapeSql(v.ram || "Standard")},
    ${escapeSql(v.storage || "Standard")},
    ${Number(v.sellingPrice) || Number(p.basePrice) || 0},
    ${Number(v.mrp) || Number(p.mrp) || 0},
    ${Number(v.costPrice) || Math.round((Number(v.sellingPrice) || 0) * 0.8)},
    ${Number(v.stockQuantity) || 10},
    ${Number(v.lowStockThreshold) || 5},
    ${Boolean(v.isActive !== false)}
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;\n`;
    });
  }
});

// 4.7 HISTORICAL ORDERS SEED
sql += `\n-- 4.7 INSERT 3 HISTORICAL CUSTOMER ORDERS\n`;
sql += `-- Clean up previous historical order items if re-running migration\n`;
sql += `DELETE FROM order_items WHERE order_id IN (${orders.map((o) => escapeSql(o.id)).join(", ")});\n\n`;

orders.forEach((o) => {
  sql += `INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, cgst_amount, sgst_amount, igst_amount,
    shipping_fee, discount_amount, grand_total, payment_method,
    payment_status, status, tracking_number, created_at
) VALUES (
    ${escapeSql(o.id)},
    ${escapeSql(o.orderNumber || o.id)},
    ${escapeSql(o.customerName)},
    ${escapeSql(o.customerEmail)},
    ${escapeSql(o.customerPhone)},
    ${escapeJson(o.shippingAddress)},
    ${Number(o.subtotal) || Number(o.grandTotal) || 0},
    ${Number(o.cgstAmount) || 0},
    ${Number(o.sgstAmount) || 0},
    ${Number(o.igstAmount) || 0},
    ${Number(o.shippingFee) || 0},
    ${Number(o.discountAmount) || 0},
    ${Number(o.grandTotal) || 0},
    ${escapeSql(o.paymentMethod || "cod")},
    ${escapeSql(o.paymentStatus || "paid")},
    ${escapeSql(o.status || "confirmed")},
    ${escapeSql(o.trackingNumber || null)},
    ${escapeSql(o.createdAt || new Date().toISOString())}
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;\n`;

  if (o.items && o.items.length > 0) {
    o.items.forEach((item) => {
      sql += `INSERT INTO order_items (
    order_id, product_id, variant_id, product_title, variant_name,
    sku, quantity, unit_price, total_price
) VALUES (
    ${escapeSql(o.id)},
    ${escapeSql(item.productId || null)},
    ${escapeSql(item.variantId || null)},
    ${escapeSql(item.productTitle || item.title || "Product")},
    ${escapeSql(item.variantName || "Standard")},
    ${escapeSql(item.sku || "SKU-ITEM")},
    ${Number(item.quantity) || 1},
    ${Number(item.unitPrice) || Number(item.price) || 0},
    ${Number(item.totalPrice) || (Number(item.quantity) || 1) * (Number(item.unitPrice) || Number(item.price) || 0)}
);\n`;
    });
  }
});

fs.writeFileSync("supabase/migrations/20261111_master_database_schema_and_seed.sql", sql);
console.log("Master migration file generated successfully!");
console.log("Size:", fs.statSync("supabase/migrations/20261111_master_database_schema_and_seed.sql").size, "bytes");

