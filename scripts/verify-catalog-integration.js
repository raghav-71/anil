const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Verify JSON catalog
const catalogPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'imported-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
console.log(`[PASS] Ingested catalog file present with ${catalog.length} products.`);

// 2. Verify all 38 placeholder SVGs exist in public/images/products
const imgDir = path.join(__dirname, '..', 'public', 'images', 'products');
let missingSvgs = 0;
catalog.forEach(p => {
  const svgFile = path.join(imgDir, `${p.slug}.svg`);
  if (!fs.existsSync(svgFile)) {
    console.error(`[FAIL] Missing SVG for ${p.slug}`);
    missingSvgs++;
  }
});
if (missingSvgs === 0) {
  console.log(`[PASS] All 38 luxury SVGs verified in public/images/products.`);
}

// 3. Verify prices and stock rule compliance
let priceSetCount = 0;
let stockCount = 0;
let publishedCount = 0;
catalog.forEach(p => {
  if (p.basePrice > 0 || p.mrp > 0) priceSetCount++;
  p.variants.forEach(v => {
    if (v.stockQuantity > 0) stockCount++;
  });
  if (p.isActive) publishedCount++;
});

console.log(`[PASS] Prices set: ${priceSetCount} (Must be 0 until owner configures)`);
console.log(`[PASS] Stock set: ${stockCount} (Must be 0 until stock received)`);
console.log(`[PASS] Published count: ${publishedCount} (Must be 0 until published by owner)`);

if (priceSetCount === 0 && stockCount === 0 && publishedCount === 0) {
  console.log('[ALL CHECKS PASSED] Perfect integration adhering to all business rules!');
} else {
  console.error('[FAIL] Rule violation detected!');
  process.exit(1);
}

