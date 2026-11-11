-- ======================================================================================
-- MASTER PRODUCTION MIGRATION & SEED: ANIL COMMUNICATION & ZEROX
-- File: 20261111_master_database_schema_and_seed.sql
-- Single Source of Truth PostgreSQL Database Setup
-- Generated: 2026-11-11T02:39:30.279Z
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
    'ANIL COMMUNICATION & ZEROX',
    'Premium Smartphones & High-Speed Accessories',
    '+91 9380124254',
    'admin@anilcommunications.com',
    'Bagalkot Main Road, Pant Nagar, Near Canara Bank',
    'Belagavi', 'Karnataka', '591103',
    '29AAAAA0000A1Z5',
    'ACZ-', 1001, true, 1000, 99, '919380124254'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address;

-- 4.5 INSERT 36 CATALOG PRODUCTS WITH CDN STORAGE IMAGES
INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-moto-g37-power',
    'Moto G37 Power',
    'moto-g37-power',
    'b-motorola',
    'Motorola',
    'cat-smartphones',
    'Smartphones',
    'Motorola Moto G37 Power with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Moto G37 Power by Motorola in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    14000,
    15999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/moto-g37-power.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/moto-g37-power.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '["100% Genuine Brand New Retail Unit","Official Manufacturer Warranty with GST Invoice","Express Secure Delivery in Pant Nagar & Across India"]'::jsonb,
    '{"Network Type":"5G, 4G VOLTE, 3G, 2G","SIM Type":"Dual SIM (Nano-SIM, dual stand-by)","In The Box":"Handset, Adapter, USB Cable, SIM Ejector, Protective Case"}'::jsonb,
    '7 Days Replacement for Technical & Hardware Defects'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-oppo-a6-5g',
    'OPPO A6 5G',
    'oppo-a6-5g',
    'b-oppo',
    'OPPO',
    'cat-smartphones',
    'Smartphones',
    'OPPO A6 5G with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'OPPO A6 5G by OPPO in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    14999,
    17999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/oppo-a6-5g.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/oppo-a6-5g.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-vivo-y31t-5g',
    'Vivo Y31T 5G',
    'vivo-y31t-5g',
    'b-vivo',
    'Vivo',
    'cat-smartphones',
    'Smartphones',
    'Vivo Y31T 5G with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Vivo Y31T 5G by Vivo in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    16499,
    19999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/vivo-y31t-5g.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/vivo-y31t-5g.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-c100-5g',
    'Realme C100 5G',
    'realme-c100-5g',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme C100 5G with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme C100 5G by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    11999,
    13999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-c100-5g.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-c100-5g.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-16',
    'Realme 16',
    'realme-16',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme 16 with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme 16 by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    18999,
    21999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-16.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-16.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-16x',
    'Realme 16X',
    'realme-16x',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme 16X with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme 16X by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    15999,
    18999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-16x.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-16x.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-16-pro',
    'Realme 16 Pro',
    'realme-16-pro',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme 16 Pro with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme 16 Pro by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    24999,
    28999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-16-pro.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-16-pro.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-16t',
    'Realme 16T',
    'realme-16t',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme 16T with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme 16T by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    21999,
    24999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-16t.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-16t.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-redmi-a7-pro',
    'Redmi A7 Pro',
    'redmi-a7-pro',
    'b-redmi',
    'Redmi',
    'cat-smartphones',
    'Smartphones',
    'Redmi A7 Pro with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Redmi A7 Pro by Redmi in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    8999,
    10999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/redmi-a7-pro.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/redmi-a7-pro.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-realme-11x',
    'Realme 11X',
    'realme-11x',
    'b-realme',
    'Realme',
    'cat-smartphones',
    'Smartphones',
    'Realme 11X with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Realme 11X by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    13999,
    16999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/realme-11x.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/realme-11x.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-vivo-y11-5g',
    'Vivo Y11 5G',
    'vivo-y11-5g',
    'b-vivo',
    'Vivo',
    'cat-smartphones',
    'Smartphones',
    'Vivo Y11 5G with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Vivo Y11 5G by Vivo in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    10999,
    12999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/vivo-y11-5g.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/vivo-y11-5g.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-poco-c85x',
    'POCO C85X',
    'poco-c85x',
    'b-poco',
    'POCO',
    'cat-smartphones',
    'Smartphones',
    'POCO C85X with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'POCO C85X by POCO in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    9499,
    11999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/poco-c85x.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/poco-c85x.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-motorola-g06-power',
    'Motorola G06 Power',
    'motorola-g06-power',
    'b-motorola',
    'Motorola',
    'cat-smartphones',
    'Smartphones',
    'Motorola G06 Power with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Motorola G06 Power by Motorola in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    11499,
    13999,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/motorola-g06-power.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/motorola-g06-power.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-lava-a3-torch',
    'Lava A3 Torch',
    'lava-a3-torch',
    'b-lava',
    'Lava',
    'cat-keypad',
    'Keypad Phones',
    'Lava A3 Torch with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Lava A3 Torch by Lava in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1299,
    1599,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/lava-a3-torch.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/lava-a3-torch.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-cellecor-keypad',
    'Cellecor Keypad Phone',
    'cellecor-keypad',
    'b-cellecor',
    'Cellecor',
    'cat-keypad',
    'Keypad Phones',
    'Cellecor Keypad Phone with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Cellecor Keypad Phone by Cellecor in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    0,
    0,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/cellecor-keypad.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/cellecor-keypad.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-lava-a2-smart',
    'Lava A2 Smart',
    'lava-a2-smart',
    'b-lava',
    'Lava',
    'cat-keypad',
    'Keypad Phones',
    'Lava A2 Smart with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Lava A2 Smart by Lava in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1199,
    1499,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/lava-a2-smart.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/lava-a2-smart.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-jio-bharat-g2',
    'Jio Bharat G2',
    'jio-bharat-g2',
    'b-jio',
    'Jio',
    'cat-keypad',
    'Keypad Phones',
    'Jio Bharat G2 with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Jio Bharat G2 by Jio in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    999,
    1299,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/jio-bharat-g2.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/jio-bharat-g2.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-cellecor-cli',
    'Cellecor CLI',
    'cellecor-cli',
    'b-cellecor',
    'Cellecor',
    'cat-keypad',
    'Keypad Phones',
    'Cellecor CLI with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Cellecor CLI by Cellecor in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1149,
    1399,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/cellecor-cli.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/cellecor-cli.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-itel-ace-2-mega',
    'itel Ace 2 Mega',
    'itel-ace-2-mega',
    'b-itel',
    'itel',
    'cat-keypad',
    'Keypad Phones',
    'itel Ace 2 Mega with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'itel Ace 2 Mega by itel in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1049,
    1299,
    '85171300',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/itel-ace-2-mega.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/itel-ace-2-mega.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-airdopes-156-nirvana',
    'boAt Airdopes 156 Nirvana',
    'boat-airdopes-156-nirvana',
    'b-boat',
    'boAt',
    'cat-earbuds',
    'Earbuds',
    'boAt Airdopes 156 Nirvana with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Airdopes 156 Nirvana by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1499,
    2990,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-airdopes-156-nirvana.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-airdopes-156-nirvana.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-hop-pods',
    'KDM Hop Pods',
    'kdm-hop-pods',
    'b-kdm',
    'KDM',
    'cat-earbuds',
    'Earbuds',
    'KDM Hop Pods with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Hop Pods by KDM in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1199,
    1999,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-hop-pods.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-hop-pods.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-morbi-earbuds',
    'Morbi Earbuds',
    'morbi-earbuds',
    'b-morbi',
    'Morbi',
    'cat-earbuds',
    'Earbuds',
    'Morbi Earbuds with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Morbi Earbuds by Morbi in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    899,
    1499,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/morbi-earbuds.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/morbi-earbuds.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-airdopes-91-prime',
    'boAt Airdopes 91 Prime',
    'boat-airdopes-91-prime',
    'b-boat',
    'boAt',
    'cat-earbuds',
    'Earbuds',
    'boAt Airdopes 91 Prime with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Airdopes 91 Prime by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1099,
    2490,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-airdopes-91-prime.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-airdopes-91-prime.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-airdopes-213',
    'boAt Airdopes 213',
    'boat-airdopes-213',
    'b-boat',
    'boAt',
    'cat-earbuds',
    'Earbuds',
    'boAt Airdopes 213 with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Airdopes 213 by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1299,
    2790,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-airdopes-213.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-airdopes-213.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-fan-pods',
    'KDM Fan Pods',
    'kdm-fan-pods',
    'b-kdm',
    'KDM',
    'cat-earbuds',
    'Earbuds',
    'KDM Fan Pods with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Fan Pods by KDM in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1099,
    1899,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-fan-pods.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-fan-pods.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-evergreen',
    'KDM Evergreen',
    'kdm-evergreen',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Evergreen with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Evergreen by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    899,
    1499,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-evergreen.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-evergreen.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-alpha',
    'KDM Alpha',
    'kdm-alpha',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Alpha with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Alpha by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    799,
    1299,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-alpha.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-alpha.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-daurandhar',
    'KDM Daurandhar',
    'kdm-daurandhar',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Daurandhar with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Daurandhar by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    999,
    1699,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-daurandhar.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-daurandhar.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-noble-band',
    'KDM Noble Band',
    'kdm-noble-band',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Noble Band with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Noble Band by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    849,
    1399,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-noble-band.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-noble-band.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-vibronix',
    'KDM Vibronix',
    'kdm-vibronix',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Vibronix with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Vibronix by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    949,
    1599,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-vibronix.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-vibronix.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-touchband',
    'KDM Touchband',
    'kdm-touchband',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Touchband with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Touchband by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    899,
    1499,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-touchband.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-touchband.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-kdm-glamour',
    'KDM Glamour',
    'kdm-glamour',
    'b-kdm',
    'KDM',
    'cat-neckbands',
    'Neckbands',
    'KDM Glamour with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'KDM Glamour by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    799,
    1299,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/kdm-glamour.webp","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/kdm-glamour.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-rockerz-103-pro',
    'boAt Rockerz 103 Pro',
    'boat-rockerz-103-pro',
    'b-boat',
    'boAt',
    'cat-neckbands',
    'Neckbands',
    'boAt Rockerz 103 Pro with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Rockerz 103 Pro by boAt in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    999,
    1990,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-rockerz-103-pro.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-rockerz-103-pro.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-rockerz-425',
    'boAt Rockerz 425',
    'boat-rockerz-425',
    'b-boat',
    'boAt',
    'cat-headphones',
    'Headphones',
    'boAt Rockerz 425 with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Rockerz 425 by boAt in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1499,
    2990,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-rockerz-425.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-rockerz-425.svg"]'::jsonb,
    true,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-boat-rockerz-trendz',
    'boAt Rockerz Trendz',
    'boat-rockerz-trendz',
    'b-boat',
    'boAt',
    'cat-headphones',
    'Headphones',
    'boAt Rockerz Trendz with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'boAt Rockerz Trendz by boAt in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    1399,
    2690,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/boat-rockerz-trendz.png","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/boat-rockerz-trendz.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

INSERT INTO products (
    id, title, slug, brand_id, brand_name, category_id, category_name,
    short_description, description, base_price, mrp, hsn_code, gst_rate,
    images, is_featured, is_active, warranty_summary, rating, review_count,
    highlights, specifications, return_policy
) VALUES (
    'prod-zebronics-model-to-confirm',
    'Zebronics Headphones (model to confirm)',
    'zebronics-model-to-confirm',
    'b-zebronics',
    'Zebronics',
    'cat-headphones',
    'Headphones',
    'Zebronics Headphones (model to confirm) with authentic manufacturer warranty. Available at Anil Communications Pant Nagar.',
    'Zebronics Headphones (model to confirm) by Zebronics in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.',
    0,
    0,
    '85183000',
    18,
    '["https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/catalog/zebronics-model-to-confirm.jpg","https://rznnaukzdytgrhzfezqb.supabase.co/storage/v1/object/public/product-images/svg/zebronics-model-to-confirm.svg"]'::jsonb,
    false,
    true,
    '1 Year Official Brand Warranty',
    4.8,
    12,
    '[]'::jsonb,
    '{}'::jsonb,
    '7-Day Return / Replacement directly at our Belagavi outlet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    base_price = EXCLUDED.base_price,
    mrp = EXCLUDED.mrp,
    images = EXCLUDED.images,
    is_active = EXCLUDED.is_active;

-- 4.6 INSERT 40 PRODUCT VARIANTS
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-moto-g37-power-01',
    'prod-moto-g37-power',
    'AC-MOT-MOTO-G37-1',
    '8906000000001',
    'Standard',
    '#493129',
    '4GB',
    '128GB',
    14000,
    15999,
    11200,
    17,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-moto-g37-power-02',
    'prod-moto-g37-power',
    'AC-MOT-MOTO-G37-2',
    '8906000000002',
    'Standard',
    '#493129',
    '12GB',
    '256GB',
    14999,
    17999,
    12600,
    15,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-oppo-a6-5g-01',
    'prod-oppo-a6-5g',
    'AC-OPP-OPPO-A6--1',
    '8906000000003',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    14999,
    17999,
    13000,
    15,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-vivo-y31t-5g-01',
    'prod-vivo-y31t-5g',
    'AC-VIV-VIVO-Y31-1',
    '8906000000004',
    'Standard',
    '#493129',
    '6GB',
    '128GB',
    16499,
    19999,
    14500,
    12,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-c100-5g-01',
    'prod-realme-c100-5g',
    'AC-REA-REALME-C-1',
    '8906000000005',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    11999,
    13999,
    10400,
    20,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16-01',
    'prod-realme-16',
    'AC-REA-16-01',
    '8906000000007',
    'Standard',
    '#493129',
    '12GB',
    '256GB',
    18999,
    21999,
    16800,
    14,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16-02',
    'prod-realme-16',
    'AC-REA-16-02',
    '8906000000008',
    'Standard',
    '#493129',
    '8GB',
    '256GB',
    20999,
    23999,
    18200,
    11,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16x-01',
    'prod-realme-16x',
    'AC-REA-16X-01',
    '8906000000009',
    'Standard',
    '#493129',
    '6GB',
    '256GB',
    15999,
    18999,
    14000,
    15,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16x-02',
    'prod-realme-16x',
    'AC-REA-16X-02',
    '8906000000010',
    'Standard',
    '#493129',
    '6GB',
    '128GB',
    17999,
    20999,
    15400,
    12,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16-pro-01',
    'prod-realme-16-pro',
    'AC-REA-16PRO-01',
    '8906000000011',
    'Standard',
    '#493129',
    '8GB',
    '256GB',
    24999,
    28999,
    22000,
    10,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-16t-01',
    'prod-realme-16t',
    'AC-REA-16T-01',
    '8906000000012',
    'Standard',
    '#493129',
    '8GB',
    '256GB',
    21999,
    24999,
    19500,
    12,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-redmi-a7-pro-01',
    'prod-redmi-a7-pro',
    'AC-RED-REDMI-A7-1',
    '8906000000013',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    8999,
    10999,
    7800,
    25,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-redmi-a7-pro-02',
    'prod-redmi-a7-pro',
    'AC-RED-REDMI-A7-2',
    '8906000000014',
    'Standard',
    '#493129',
    '4GB',
    '128GB',
    10999,
    12999,
    9200,
    22,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-realme-11x-01',
    'prod-realme-11x',
    'AC-REA-11X-01',
    '8906000000015',
    'Standard',
    '#493129',
    '8GB',
    '128GB',
    13999,
    16999,
    12200,
    16,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-vivo-y11-5g-01',
    'prod-vivo-y11-5g',
    'AC-VIV-VIVO-Y11-1',
    '8906000000016',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    10999,
    12999,
    9500,
    18,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-poco-c85x-01',
    'prod-poco-c85x',
    'AC-POC-POCO-C85-1',
    '8906000000017',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    9499,
    11999,
    8200,
    22,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-motorola-g06-power-01',
    'prod-motorola-g06-power',
    'AC-MOT-MOTOROLA-1',
    '8906000000019',
    'Standard',
    '#493129',
    '4GB',
    '64GB',
    11499,
    13999,
    9900,
    17,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-lava-a3-torch-01',
    'prod-lava-a3-torch',
    'AC-LAV-LAVA-A3--01',
    '8906000000020',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1299,
    1599,
    950,
    35,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-cellecor-keypad-01',
    'prod-cellecor-keypad',
    'AC-CEL-KEYPAD-01',
    '8906000000021',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    0,
    0,
    0,
    10,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-lava-a2-smart-01',
    'prod-lava-a2-smart',
    'AC-LAV-LAVA-A2--01',
    '8906000000022',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1199,
    1499,
    880,
    30,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-jio-bharat-g2-01',
    'prod-jio-bharat-g2',
    'AC-JIO-JIO-BHAR-01',
    '8906000000023',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    999,
    1299,
    750,
    50,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-cellecor-cli-01',
    'prod-cellecor-cli',
    'AC-CEL-CLI-01',
    '8906000000024',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1149,
    1399,
    850,
    25,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-itel-ace-2-mega-01',
    'prod-itel-ace-2-mega',
    'AC-ITE-ITEL-ACE-01',
    '8906000000025',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1049,
    1299,
    780,
    30,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-airdopes-156-nirvana-01',
    'prod-boat-airdopes-156-nirvana',
    'AC-BOA-AIR156-01',
    '8906000000026',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1499,
    2990,
    980,
    24,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-hop-pods-01',
    'prod-kdm-hop-pods',
    'AC-KDM-KDM-HOP--01',
    '8906000000027',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1199,
    1999,
    750,
    20,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-morbi-earbuds-01',
    'prod-morbi-earbuds',
    'AC-MOR-MORBI-EA-01',
    '8906000000028',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    899,
    1499,
    550,
    25,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-airdopes-91-prime-01',
    'prod-boat-airdopes-91-prime',
    'AC-BOA-AIR91-01',
    '8906000000029',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1099,
    2490,
    700,
    30,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-airdopes-213-01',
    'prod-boat-airdopes-213',
    'AC-BOA-AIR213-01',
    '8906000000030',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1299,
    2790,
    820,
    22,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-fan-pods-01',
    'prod-kdm-fan-pods',
    'AC-KDM-KDM-FAN--01',
    '8906000000031',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1099,
    1899,
    680,
    18,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-evergreen-01',
    'prod-kdm-evergreen',
    'AC-KDM-KDM-EVER-01',
    '8906000000032',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    899,
    1499,
    540,
    30,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-alpha-01',
    'prod-kdm-alpha',
    'AC-KDM-KDM-ALPH-01',
    '8906000000033',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    799,
    1299,
    480,
    35,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-daurandhar-01',
    'prod-kdm-daurandhar',
    'AC-KDM-KDM-DAUR-01',
    '8906000000034',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    999,
    1699,
    620,
    20,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-noble-band-01',
    'prod-kdm-noble-band',
    'AC-KDM-KDM-NOBL-01',
    '8906000000035',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    849,
    1399,
    520,
    25,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-vibronix-01',
    'prod-kdm-vibronix',
    'AC-KDM-KDM-VIBR-01',
    '8906000000036',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    949,
    1599,
    590,
    22,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-touchband-01',
    'prod-kdm-touchband',
    'AC-KDM-KDM-TOUC-01',
    '8906000000037',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    899,
    1499,
    550,
    28,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-kdm-glamour-01',
    'prod-kdm-glamour',
    'AC-KDM-KDM-GLAM-01',
    '8906000000038',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    799,
    1299,
    490,
    30,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-rockerz-103-pro-01',
    'prod-boat-rockerz-103-pro',
    'AC-BOA-ROC103-01',
    '8906000000039',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    999,
    1990,
    630,
    40,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-rockerz-425-01',
    'prod-boat-rockerz-425',
    'AC-BOA-ROC425-01',
    '8906000000040',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1499,
    2990,
    950,
    18,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-boat-rockerz-trendz-01',
    'prod-boat-rockerz-trendz',
    'AC-BOA-ROCTRENDZ-01',
    '8906000000041',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    1399,
    2690,
    890,
    20,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;
INSERT INTO product_variants (
    id, product_id, sku, barcode, color, color_code, ram, storage,
    selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active
) VALUES (
    'var-zebronics-model-to-confirm-01',
    'prod-zebronics-model-to-confirm',
    'AC-ZEB-ZEBRONIC-01',
    '8906000000042',
    'Standard',
    '#493129',
    'Standard',
    'Standard',
    0,
    0,
    0,
    10,
    5,
    true
) ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    barcode = EXCLUDED.barcode,
    selling_price = EXCLUDED.selling_price,
    mrp = EXCLUDED.mrp,
    stock_quantity = EXCLUDED.stock_quantity;

-- 4.7 INSERT 3 HISTORICAL CUSTOMER ORDERS
-- Clean up previous historical order items if re-running migration
DELETE FROM order_items WHERE order_id IN ('ord-1794295818209', 'ord-1794295734206', 'ord-1');

INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, cgst_amount, sgst_amount, igst_amount,
    shipping_fee, discount_amount, grand_total, payment_method,
    payment_status, status, tracking_number, created_at
) VALUES (
    'ord-1794295818209',
    'ORD-261110-G6MPY',
    'Pooja Reddy',
    'pooja.reddy@example.com',
    '9880098765',
    '{"street":"12/A, 4th Cross, Pant Nagar","state":"Karnataka","pincode":"591103","city":"Pant Nagar"}'::jsonb,
    1499,
    0,
    0,
    0,
    0,
    0,
    1499,
    'razorpay',
    'paid',
    'confirmed',
    NULL,
    '2026-11-10T07:30:18.209Z'
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;
INSERT INTO order_items (
    order_id, product_id, variant_id, product_title, variant_name,
    sku, quantity, unit_price, total_price
) VALUES (
    'ord-1794295818209',
    NULL,
    'var-boat-airdopes-156-nirvana-01',
    'Product',
    'Standard',
    'SKU-ITEM',
    1,
    1499,
    1499
);
INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, cgst_amount, sgst_amount, igst_amount,
    shipping_fee, discount_amount, grand_total, payment_method,
    payment_status, status, tracking_number, created_at
) VALUES (
    'ord-1794295734206',
    'ORD-261110-G7EII',
    'Anand Kulkarni',
    'anand.kulkarni@example.com',
    '9845112233',
    '{"street":"Pant Nagar Main Street, Near Canara Bank","city":"Pant Nagar","pincode":"591103","state":"Karnataka","landmark":"Near Canara Bank"}'::jsonb,
    14000,
    0,
    0,
    0,
    0,
    0,
    14000,
    'cod',
    'pending',
    'shipped',
    'DEL-591103-8821',
    '2026-11-10T07:28:54.206Z'
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;
INSERT INTO order_items (
    order_id, product_id, variant_id, product_title, variant_name,
    sku, quantity, unit_price, total_price
) VALUES (
    'ord-1794295734206',
    NULL,
    'var-moto-g37-power-01',
    'Product',
    'Standard',
    'SKU-ITEM',
    1,
    14000,
    14000
);
INSERT INTO orders (
    id, order_number, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, cgst_amount, sgst_amount, igst_amount,
    shipping_fee, discount_amount, grand_total, payment_method,
    payment_status, status, tracking_number, created_at
) VALUES (
    'ord-1',
    'ORD-2026-94812',
    'Ramesh Sharma',
    'ramesh.sharma@example.com',
    '9845012345',
    '{"street":"Flat 402, Prestige Palms, Indiranagar","city":"Bengaluru","state":"Karnataka","pincode":"560038"}'::jsonb,
    24999,
    0,
    0,
    0,
    0,
    0,
    24999,
    'razorpay',
    'paid',
    'delivered',
    'DEL-BGLR-88392',
    '2026-11-05T11:20:00Z'
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status;
INSERT INTO order_items (
    order_id, product_id, variant_id, product_title, variant_name,
    sku, quantity, unit_price, total_price
) VALUES (
    'ord-1',
    NULL,
    'var-iph16pm-256-nat',
    'Product',
    'Standard',
    'SKU-ITEM',
    1,
    24999,
    24999
);
