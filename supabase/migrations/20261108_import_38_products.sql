-- ======================================================================================
-- ANIL COMMUNICATIONS: IMPORT 38 STARTER CATALOGUE PRODUCTS
-- Migration: 20261108_import_38_products.sql
-- Categories: Smartphones (15), Keypad Phones (6), Earbuds (6), Neckbands (8), Headphones (3)
-- ======================================================================================

-- 1. INSERT CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones', 'Flagship, Mid-range and Budget mobile phones with 5G connectivity', '/images/products/moto-g37-power.svg', true),
  ('a0000000-0000-0000-0000-000000000002', 'Keypad Phones', 'keypad-phones', 'Reliable, durable feature phones with long-lasting battery life', '/images/products/lava-a3-torch.svg', true),
  ('a0000000-0000-0000-0000-000000000003', 'Earbuds', 'earbuds', 'True Wireless Stereo (TWS) earbuds with deep bass and ENC', '/images/products/boat-airdopes-156-nirvana.svg', true),
  ('a0000000-0000-0000-0000-000000000004', 'Neckbands', 'neckbands', 'Comfortable ergonomic wireless neckbands for music and all-day calling', '/images/products/kdm-evergreen.svg', true),
  ('a0000000-0000-0000-0000-000000000005', 'Headphones', 'headphones', 'Over-ear and on-ear wireless headphones with immersive sound', '/images/products/boat-rockerz-425.svg', true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- 2. INSERT BRANDS
INSERT INTO brands (id, name, slug, logo_url, is_featured)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Motorola', 'motorola', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000002', 'OPPO', 'oppo', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000003', 'Vivo', 'vivo', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000004', 'Realme', 'realme', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000005', 'Redmi', 'redmi', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000006', 'POCO', 'poco', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000007', 'itel', 'itel', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
  ('b0000000-0000-0000-0000-000000000008', 'Lava', 'lava', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
  ('b0000000-0000-0000-0000-000000000009', 'Cellecor', 'cellecor', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
  ('b0000000-0000-0000-0000-000000000010', 'Jio', 'jio', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=200&q=80', false),
  ('b0000000-0000-0000-0000-000000000011', 'boAt', 'boat', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000012', 'KDM', 'kdm', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', true),
  ('b0000000-0000-0000-0000-000000000013', 'Morbi', 'morbi', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', false),
  ('b0000000-0000-0000-0000-000000000014', 'Zebronics', 'zebronics', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80', false)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, is_featured = EXCLUDED.is_featured;

-- 3. INSERT PRODUCTS & VARIANTS

-- Product 1: Moto G37 Power
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000001', 
  b.id, 
  c.id, 
  'Moto G37 Power', 
  'moto-g37-power', 
  'Motorola Moto G37 Power with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Moto G37 Power by Motorola in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://cdn.beebom.com/mobile/moto-g37-power-back-front.png","/images/products/moto-g37-power.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'motorola' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001', 'AC-MOT-MOTO-G37-1', '8906000000001', 'Standard', '#493129', '4GB', '128GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001', 'AC-MOT-MOTO-G37-2', '8906000000002', 'Standard', '#493129', '12GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 2: OPPO A6 5G
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000002', 
  b.id, 
  c.id, 
  'OPPO A6 5G', 
  'oppo-a6-5g', 
  'OPPO OPPO A6 5G with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'OPPO A6 5G by OPPO in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://opsg-img-cdn-gl.heytapimg.com/epb/202404/23/v0Bf55s5s5s.png","/images/products/oppo-a6-5g.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'oppo' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002', 'AC-OPP-OPPO-A6--1', '8906000000003', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 3: Vivo Y31T 5G
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000003', 
  b.id, 
  c.id, 
  'Vivo Y31T 5G', 
  'vivo-y31t-5g', 
  'Vivo Vivo Y31T 5G with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Vivo Y31T 5G by Vivo in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://i.gadgets360cdn.com/large/vivo_y31t_5g_vivo_main_1786950340636.png","/images/products/vivo-y31t-5g.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'vivo' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003', 'AC-VIV-VIVO-Y31-1', '8906000000004', 'Standard', '#493129', '6GB', '128GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 4: Realme C100 5G
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000004', 
  b.id, 
  c.id, 
  'Realme C100 5G', 
  'realme-c100-5g', 
  'Realme Realme C100 5G with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme C100 5G by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://img.advice.co.th/images_nas/pic_product4/A0180822/A0180822OK_ORI_1.jpg","/images/products/realme-c100-5g.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0004-000000000001', 'c0000000-0000-0000-0000-000000000004', 'AC-REA-REALME-C-1', '8906000000005', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 5: Realme C100X
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000005', 
  b.id, 
  c.id, 
  'Realme C100X', 
  'realme-c100x', 
  'Realme Realme C100X with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme C100X by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/realme-c100x.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0005-000000000001', 'c0000000-0000-0000-0000-000000000005', 'AC-REA-REALME-C-1', '8906000000006', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 6: Realme 16
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000006', 
  b.id, 
  c.id, 
  'Realme 16', 
  'realme-16', 
  'Realme Realme 16 with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme 16 by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://backend.paiinternational.in/media/images/r_W2sdRnU.webp","/images/products/realme-16.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0006-000000000001', 'c0000000-0000-0000-0000-000000000006', 'AC-REA-REALME-1-1', '8906000000007', 'Standard', '#493129', '12GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0006-000000000002', 'c0000000-0000-0000-0000-000000000006', 'AC-REA-REALME-1-2', '8906000000008', 'Standard', '#493129', '8GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 7: Realme 16X
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000007', 
  b.id, 
  c.id, 
  'Realme 16X', 
  'realme-16x', 
  'Realme Realme 16X with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme 16X by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/realme-16x.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0007-000000000001', 'c0000000-0000-0000-0000-000000000007', 'AC-REA-REALME-1-1', '8906000000009', 'Standard', '#493129', '6GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0007-000000000002', 'c0000000-0000-0000-0000-000000000007', 'AC-REA-REALME-1-2', '8906000000010', 'Standard', '#493129', '6GB', '128GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 8: Realme 16 Pro
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000008', 
  b.id, 
  c.id, 
  'Realme 16 Pro', 
  'realme-16-pro', 
  'Realme Realme 16 Pro with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme 16 Pro by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://i.ebayimg.com/images/g/0BYAAeSwvltpXdLx/s-l1200.jpg","/images/products/realme-16-pro.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0008-000000000001', 'c0000000-0000-0000-0000-000000000008', 'AC-REA-REALME-1-1', '8906000000011', 'Standard', '#493129', '8GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 9: Realme 16T
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000009', 
  b.id, 
  c.id, 
  'Realme 16T', 
  'realme-16t', 
  'Realme Realme 16T with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme 16T by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/realme-16t.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0009-000000000001', 'c0000000-0000-0000-0000-000000000009', 'AC-REA-REALME-1-1', '8906000000012', 'Standard', '#493129', '8GB', '256GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 10: Redmi A7 Pro
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000a', 
  b.id, 
  c.id, 
  'Redmi A7 Pro', 
  'redmi-a7-pro', 
  'Redmi Redmi A7 Pro with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Redmi A7 Pro by Redmi in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/redmi-a7-pro.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'redmi' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000a-000000000001', 'c0000000-0000-0000-0000-00000000000a', 'AC-RED-REDMI-A7-1', '8906000000013', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000a-000000000002', 'c0000000-0000-0000-0000-00000000000a', 'AC-RED-REDMI-A7-2', '8906000000014', 'Standard', '#493129', '4GB', '128GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 11: Realme 11X
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000b', 
  b.id, 
  c.id, 
  'Realme 11X', 
  'realme-11x', 
  'Realme Realme 11X with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Realme 11X by Realme in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://image01.realme.net/general/20230823/1692787834510b64dff4866f54ef4827fc471d2bfa1ca.png","/images/products/realme-11x.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'realme' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000b-000000000001', 'c0000000-0000-0000-0000-00000000000b', 'AC-REA-REALME-1-1', '8906000000015', 'Standard', '#493129', '8GB', '128GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 12: Vivo Y11 5G
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000c', 
  b.id, 
  c.id, 
  'Vivo Y11 5G', 
  'vivo-y11-5g', 
  'Vivo Vivo Y11 5G with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Vivo Y11 5G by Vivo in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/vivo-y11-5g.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'vivo' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000c-000000000001', 'c0000000-0000-0000-0000-00000000000c', 'AC-VIV-VIVO-Y11-1', '8906000000016', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 13: POCO C85X
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000d', 
  b.id, 
  c.id, 
  'POCO C85X', 
  'poco-c85x', 
  'POCO POCO C85X with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'POCO C85X by POCO in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/poco-c85x.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'poco' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000d-000000000001', 'c0000000-0000-0000-0000-00000000000d', 'AC-POC-POCO-C85-1', '8906000000017', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 14: itel A100C
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000e', 
  b.id, 
  c.id, 
  'itel A100C', 
  'itel-a100c', 
  'itel itel A100C with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'itel A100C by itel in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/itel-a100c.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'itel' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000e-000000000001', 'c0000000-0000-0000-0000-00000000000e', 'AC-ITE-ITEL-A10-1', '8906000000018', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 15: Motorola G06 Power
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000000f', 
  b.id, 
  c.id, 
  'Motorola G06 Power', 
  'motorola-g06-power', 
  'Motorola Motorola G06 Power with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Motorola G06 Power by Motorola in category Smartphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/motorola-g06-power.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'motorola' AND c.slug = 'smartphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-000f-000000000001', 'c0000000-0000-0000-0000-00000000000f', 'AC-MOT-MOTOROLA-1', '8906000000019', 'Standard', '#493129', '4GB', '64GB', 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 16: Lava A3 Torch
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000010', 
  b.id, 
  c.id, 
  'Lava A3 Torch', 
  'lava-a3-torch', 
  'Lava Lava A3 Torch with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Lava A3 Torch by Lava in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://www.jiomart.com/images/product/original/rvladyvkek/lava-a3-torch-dual-sim-dark-blue-keypad-phone-product-images-orvladyvkek-p612488038-4-202509190005.jpg?im=Resize%3D%281000%2C1000%29","/images/products/lava-a3-torch.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'lava' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0010-000000000001', 'c0000000-0000-0000-0000-000000000010', 'AC-LAV-LAVA-A3--01', '8906000000020', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 17: Cellecor Keypad Phone
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000011', 
  b.id, 
  c.id, 
  'Cellecor Keypad Phone', 
  'cellecor-keypad', 
  'Cellecor Cellecor Keypad Phone with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Cellecor Keypad Phone by Cellecor in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/cellecor-keypad.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'cellecor' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0011-000000000001', 'c0000000-0000-0000-0000-000000000011', 'AC-CEL-CELLECOR-01', '8906000000021', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 18: Lava A2 Smart
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000012', 
  b.id, 
  c.id, 
  'Lava A2 Smart', 
  'lava-a2-smart', 
  'Lava Lava A2 Smart with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Lava A2 Smart by Lava in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://www.sathya.store/img/product/vryIx85lbfG6sDw7.png","/images/products/lava-a2-smart.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'lava' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0012-000000000001', 'c0000000-0000-0000-0000-000000000012', 'AC-LAV-LAVA-A2--01', '8906000000022', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 19: Jio Bharat G2
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000013', 
  b.id, 
  c.id, 
  'Jio Bharat G2', 
  'jio-bharat-g2', 
  'Jio Jio Bharat G2 with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Jio Bharat G2 by Jio in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["https://www.jio.com/jio-bharat-phone-v2-black.png","/images/products/jio-bharat-g2.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'jio' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0013-000000000001', 'c0000000-0000-0000-0000-000000000013', 'AC-JIO-JIO-BHAR-01', '8906000000023', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 20: Cellecor CLI
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000014', 
  b.id, 
  c.id, 
  'Cellecor CLI', 
  'cellecor-cli', 
  'Cellecor Cellecor CLI with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Cellecor CLI by Cellecor in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/cellecor-cli.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'cellecor' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0014-000000000001', 'c0000000-0000-0000-0000-000000000014', 'AC-CEL-CELLECOR-01', '8906000000024', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 21: itel Ace 2 Mega
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000015', 
  b.id, 
  c.id, 
  'itel Ace 2 Mega', 
  'itel-ace-2-mega', 
  'itel itel Ace 2 Mega with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'itel Ace 2 Mega by itel in category Keypad Phones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85171300', 
  18, 
  '["/images/products/itel-ace-2-mega.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'itel' AND c.slug = 'keypad'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0015-000000000001', 'c0000000-0000-0000-0000-000000000015', 'AC-ITE-ITEL-ACE-01', '8906000000025', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 22: boAt Airdopes 156 Nirvana
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000016', 
  b.id, 
  c.id, 
  'boAt Airdopes 156 Nirvana', 
  'boat-airdopes-156-nirvana', 
  'boAt boAt Airdopes 156 Nirvana with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Airdopes 156 Nirvana by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["https://cdn.shopify.com/s/files/1/0057/8938/4802/files/Airdopes_141.png","/images/products/boat-airdopes-156-nirvana.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0016-000000000001', 'c0000000-0000-0000-0000-000000000016', 'AC-BOA-BOAT-AIR-01', '8906000000026', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 23: KDM Hop Pods
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000017', 
  b.id, 
  c.id, 
  'KDM Hop Pods', 
  'kdm-hop-pods', 
  'KDM KDM Hop Pods with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Hop Pods by KDM in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["https://halfpe.com/cdn/shop/files/71xL8HG5X2L._SL1500.jpg?v=1765438451&width=1946","/images/products/kdm-hop-pods.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0017-000000000001', 'c0000000-0000-0000-0000-000000000017', 'AC-KDM-KDM-HOP--01', '8906000000027', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 24: Morbi Earbuds
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000018', 
  b.id, 
  c.id, 
  'Morbi Earbuds', 
  'morbi-earbuds', 
  'Morbi Morbi Earbuds with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Morbi Earbuds by Morbi in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/morbi-earbuds.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'morbi' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0018-000000000001', 'c0000000-0000-0000-0000-000000000018', 'AC-MOR-MORBI-EA-01', '8906000000028', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 25: boAt Airdopes 91 Prime
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000019', 
  b.id, 
  c.id, 
  'boAt Airdopes 91 Prime', 
  'boat-airdopes-91-prime', 
  'boAt boAt Airdopes 91 Prime with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Airdopes 91 Prime by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["https://gadgetsense.in/wp-content/uploads/2025/07/boAt-Airdopes-91-Prime-1-e1759495251976.jpg","/images/products/boat-airdopes-91-prime.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0019-000000000001', 'c0000000-0000-0000-0000-000000000019', 'AC-BOA-BOAT-AIR-01', '8906000000029', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 26: boAt Airdopes 213
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001a', 
  b.id, 
  c.id, 
  'boAt Airdopes 213', 
  'boat-airdopes-213', 
  'boAt boAt Airdopes 213 with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Airdopes 213 by boAt in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/boat-airdopes-213.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001a-000000000001', 'c0000000-0000-0000-0000-00000000001a', 'AC-BOA-BOAT-AIR-01', '8906000000030', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 27: KDM Fan Pods
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001b', 
  b.id, 
  c.id, 
  'KDM Fan Pods', 
  'kdm-fan-pods', 
  'KDM KDM Fan Pods with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Fan Pods by KDM in category Earbuds. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-fan-pods.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'earbuds'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001b-000000000001', 'c0000000-0000-0000-0000-00000000001b', 'AC-KDM-KDM-FAN--01', '8906000000031', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 28: KDM Evergreen
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001c', 
  b.id, 
  c.id, 
  'KDM Evergreen', 
  'kdm-evergreen', 
  'KDM KDM Evergreen with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Evergreen by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-evergreen.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001c-000000000001', 'c0000000-0000-0000-0000-00000000001c', 'AC-KDM-KDM-EVER-01', '8906000000032', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 29: KDM Alpha
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001d', 
  b.id, 
  c.id, 
  'KDM Alpha', 
  'kdm-alpha', 
  'KDM KDM Alpha with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Alpha by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-alpha.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001d-000000000001', 'c0000000-0000-0000-0000-00000000001d', 'AC-KDM-KDM-ALPH-01', '8906000000033', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 30: KDM Daurandhar
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001e', 
  b.id, 
  c.id, 
  'KDM Daurandhar', 
  'kdm-daurandhar', 
  'KDM KDM Daurandhar with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Daurandhar by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-daurandhar.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001e-000000000001', 'c0000000-0000-0000-0000-00000000001e', 'AC-KDM-KDM-DAUR-01', '8906000000034', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 31: KDM Noble Band
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-00000000001f', 
  b.id, 
  c.id, 
  'KDM Noble Band', 
  'kdm-noble-band', 
  'KDM KDM Noble Band with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Noble Band by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-noble-band.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-001f-000000000001', 'c0000000-0000-0000-0000-00000000001f', 'AC-KDM-KDM-NOBL-01', '8906000000035', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 32: KDM Vibronix
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000020', 
  b.id, 
  c.id, 
  'KDM Vibronix', 
  'kdm-vibronix', 
  'KDM KDM Vibronix with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Vibronix by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-vibronix.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0020-000000000001', 'c0000000-0000-0000-0000-000000000020', 'AC-KDM-KDM-VIBR-01', '8906000000036', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 33: KDM Touchband
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000021', 
  b.id, 
  c.id, 
  'KDM Touchband', 
  'kdm-touchband', 
  'KDM KDM Touchband with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Touchband by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-touchband.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0021-000000000001', 'c0000000-0000-0000-0000-000000000021', 'AC-KDM-KDM-TOUC-01', '8906000000037', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 34: KDM Glamour
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000022', 
  b.id, 
  c.id, 
  'KDM Glamour', 
  'kdm-glamour', 
  'KDM KDM Glamour with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'KDM Glamour by KDM in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/kdm-glamour.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'kdm' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0022-000000000001', 'c0000000-0000-0000-0000-000000000022', 'AC-KDM-KDM-GLAM-01', '8906000000038', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 35: boAt Rockerz 103 Pro
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000023', 
  b.id, 
  c.id, 
  'boAt Rockerz 103 Pro', 
  'boat-rockerz-103-pro', 
  'boAt boAt Rockerz 103 Pro with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Rockerz 103 Pro by boAt in category Neckbands. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["https://cdn.shopify.com/s/files/1/0057/8938/4802/products/m-black.png","/images/products/boat-rockerz-103-pro.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'neckbands'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0023-000000000001', 'c0000000-0000-0000-0000-000000000023', 'AC-BOA-BOAT-ROC-01', '8906000000039', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 36: boAt Rockerz 425
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000024', 
  b.id, 
  c.id, 
  'boAt Rockerz 425', 
  'boat-rockerz-425', 
  'boAt boAt Rockerz 425 with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Rockerz 425 by boAt in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["https://www.bbassets.com/media/uploads/p/xl/40338188_1-boat-40mm-drivers-boat-signature-sound-25-hours-playtime-beast-mode-low-latency-bluetooth-v52-adaptive-fit-dual-pairing-type-c-interface-voice-assistant.jpg","/images/products/boat-rockerz-425.svg"]'::jsonb, 
  true, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'headphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0024-000000000001', 'c0000000-0000-0000-0000-000000000024', 'AC-BOA-BOAT-ROC-01', '8906000000040', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 37: boAt Rockerz Trendz
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000025', 
  b.id, 
  c.id, 
  'boAt Rockerz Trendz', 
  'boat-rockerz-trendz', 
  'boAt boAt Rockerz Trendz with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'boAt Rockerz Trendz by boAt in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/boat-rockerz-trendz.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'boat' AND c.slug = 'headphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0025-000000000001', 'c0000000-0000-0000-0000-000000000025', 'AC-BOA-BOAT-ROC-01', '8906000000041', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;

-- Product 38: Zebronics Headphones (model to confirm)
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  'c0000000-0000-0000-0000-000000000026', 
  b.id, 
  c.id, 
  'Zebronics Headphones (model to confirm)', 
  'zebronics-model-to-confirm', 
  'Zebronics Zebronics Headphones (model to confirm) with authentic manufacturer warranty. Available at Anil Communications Belagavi.', 
  'Zebronics Headphones (model to confirm) by Zebronics in category Headphones. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.', 
  0, 
  0, 
  '85183000', 
  18, 
  '["/images/products/zebronics-model-to-confirm.svg"]'::jsonb, 
  false, 
  true, 
  '1 Year Official Brand Warranty', 
  4.8, 
  12
FROM brands b, categories c
WHERE b.slug = 'zebronics' AND c.slug = 'headphones'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('d0000000-0000-0000-0026-000000000001', 'c0000000-0000-0000-0000-000000000026', 'AC-ZEB-ZEBRONIC-01', '8906000000042', 'Standard', '#493129', NULL, NULL, 0, 0, 0, 0, 5, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
