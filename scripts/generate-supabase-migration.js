const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'imported-catalog.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let sql = `-- ======================================================================================
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
`;

products.forEach((p, idx) => {
  const pUuid = `c0000000-0000-0000-0000-${(idx + 1).toString(16).padStart(12, '0')}`;
  const imagesJson = JSON.stringify(p.images).replace(/'/g, "''");
  const title = p.title.replace(/'/g, "''");
  const desc = p.description.replace(/'/g, "''");
  const shortDesc = p.shortDescription.replace(/'/g, "''");

  sql += `
-- Product ${idx + 1}: ${p.title}
INSERT INTO products (id, brand_id, category_id, title, slug, short_description, description, base_price, mrp, hsn_code, gst_rate, images, is_featured, is_active, warranty_summary, rating, review_count)
SELECT 
  '${pUuid}', 
  b.id, 
  c.id, 
  '${title}', 
  '${p.slug}', 
  '${shortDesc}', 
  '${desc}', 
  ${p.basePrice}, 
  ${p.mrp}, 
  '${p.hsnCode}', 
  ${p.gstRate}, 
  '${imagesJson}'::jsonb, 
  ${p.isFeatured}, 
  true, 
  '${p.warrantySummary}', 
  ${p.rating}, 
  ${p.reviewCount}
FROM brands b, categories c
WHERE b.slug = '${p.brandId.replace('b-', '')}' AND c.slug = '${p.categoryId.replace('cat-', '')}'
ON CONFLICT (slug) DO UPDATE 
SET is_active = true, title = EXCLUDED.title;
`;

  p.variants.forEach((v, vIdx) => {
    const vUuid = `d0000000-0000-0000-${(idx + 1).toString(16).padStart(4, '0')}-${(vIdx + 1).toString(16).padStart(12, '0')}`;
    const ram = v.ram ? `'${v.ram}'` : 'NULL';
    const storage = v.storage ? `'${v.storage}'` : 'NULL';

    sql += `INSERT INTO product_variants (id, product_id, sku, barcode, color, color_code, ram, storage, selling_price, mrp, cost_price, stock_quantity, low_stock_threshold, is_active)
VALUES ('${vUuid}', '${pUuid}', '${v.sku}', '${v.barcode}', '${v.color}', '${v.colorCode}', ${ram}, ${storage}, ${v.sellingPrice}, ${v.mrp}, ${v.costPrice}, ${v.stockQuantity}, ${v.lowStockThreshold}, true)
ON CONFLICT (sku) DO UPDATE 
SET is_active = true;
`;
  });
});

const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261108_import_38_products.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Generated Supabase SQL migration at: ${outPath}`);

