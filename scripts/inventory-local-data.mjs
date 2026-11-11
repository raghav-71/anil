import fs from "fs";

const catalog = JSON.parse(fs.readFileSync("src/lib/database/imported-catalog.json", "utf8"));
console.log(`TOTAL PRODUCTS IN LOCAL CATALOG: ${catalog.length}`);

let totalVariants = 0;
let totalImages = 0;
const categoriesMap = new Map();
const brandsMap = new Map();

catalog.forEach((p, idx) => {
  totalVariants += p.variants?.length || 0;
  totalImages += p.images?.length || 0;
  const cat = p.categoryName || p.categoryId;
  categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
  const brand = p.brandName || p.brandId;
  brandsMap.set(brand, (brandsMap.get(brand) || 0) + 1);
  console.log(`${idx + 1}. [${p.id}] "${p.title}" | ₹${p.basePrice} | MRP: ₹${p.mrp} | Stock: ${p.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0)} | Images: ${p.images?.length || 0}`);
});

console.log("\n--- CATEGORIES BREAKDOWN ---");
for (const [k, v] of categoriesMap.entries()) console.log(`- ${k}: ${v} products`);

console.log("\n--- BRANDS BREAKDOWN ---");
for (const [k, v] of brandsMap.entries()) console.log(`- ${k}: ${v} products`);

console.log(`\nTOTAL VARIANTS: ${totalVariants}`);
console.log(`TOTAL IMAGE REFERENCES: ${totalImages}`);

// Orders
if (fs.existsSync("src/lib/database/orders.json")) {
  const orders = JSON.parse(fs.readFileSync("src/lib/database/orders.json", "utf8"));
  console.log(`\nTOTAL ORDERS: ${orders.length}`);
  orders.forEach((o, i) => {
    console.log(`${i + 1}. Order #${o.orderNumber || o.id} | Customer: ${o.customerName} (${o.customerPhone}) | Amount: ₹${o.grandTotal} | Status: ${o.status} | Items: ${o.items?.length || 0}`);
  });
}

