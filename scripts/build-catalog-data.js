const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '..', 'catalog_temp', 'anil-communications-catalog', 'src', 'data', 'products.ts');
const content = fs.readFileSync(productsFile, 'utf8');

const jsonMatch = content.match(/export const products: StoreProduct\[\] = (\[[\s\S]*?\]);/);
const jsonStr = jsonMatch[1].replace(/,\s*([\]}])/g, '$1');
const rawProducts = JSON.parse(jsonStr);

const brandMap = {
  "Motorola": { id: "b-motorola", name: "Motorola", slug: "motorola" },
  "OPPO": { id: "b-oppo", name: "OPPO", slug: "oppo" },
  "Vivo": { id: "b-vivo", name: "Vivo", slug: "vivo" },
  "Realme": { id: "b-realme", name: "Realme", slug: "realme" },
  "Redmi": { id: "b-redmi", name: "Redmi", slug: "redmi" },
  "POCO": { id: "b-poco", name: "POCO", slug: "poco" },
  "itel": { id: "b-itel", name: "itel", slug: "itel" },
  "Lava": { id: "b-lava", name: "Lava", slug: "lava" },
  "Cellecor": { id: "b-cellecor", name: "Cellecor", slug: "cellecor" },
  "Jio": { id: "b-jio", name: "Jio", slug: "jio" },
  "boAt": { id: "b-boat", name: "boAt", slug: "boat" },
  "KDM": { id: "b-kdm", name: "KDM", slug: "kdm" },
  "Morbi": { id: "b-morbi", name: "Morbi", slug: "morbi" },
  "Zebronics": { id: "b-zebronics", name: "Zebronics", slug: "zebronics" },
};

const categoryMap = {
  "Smartphones": { id: "cat-smartphones", name: "Smartphones", hsn: "85171300" },
  "Keypad Phones": { id: "cat-keypad", name: "Keypad Phones", hsn: "85171300" },
  "Earbuds": { id: "cat-earbuds", name: "Earbuds", hsn: "85183000" },
  "Neckbands": { id: "cat-neckbands", name: "Neckbands", hsn: "85183000" },
  "Headphones": { id: "cat-headphones", name: "Headphones", hsn: "85183000" },
};

let barcodeSeed = 8906000000000;

const transformedProducts = rawProducts.map((p, index) => {
  const brand = brandMap[p.brand] || { id: `b-${p.brand.toLowerCase()}`, name: p.brand, slug: p.brand.toLowerCase() };
  const cat = categoryMap[p.category] || { id: "cat-smartphones", name: p.category, hsn: "85171300" };
  const prodId = `prod-${p.id}`;

  const images = [];
  if (p.imageUrl) {
    images.push(p.imageUrl);
  }
  images.push(`/images/products/${p.id}.svg`);

  // Build variants
  let variants = [];
  if (p.variants && p.variants.length > 0) {
    variants = p.variants.map((vStr, vIdx) => {
      barcodeSeed++;
      const [ramPart, storagePart] = vStr.split('/').map(s => s.trim());
      const varId = `var-${p.id}-${(vIdx + 1).toString().padStart(2, '0')}`;
      const sku = `AC-${brand.name.toUpperCase().substring(0, 3)}-${p.id.toUpperCase().substring(0, 8)}-${(vIdx + 1)}`;
      return {
        id: varId,
        productId: prodId,
        sku: sku,
        barcode: barcodeSeed.toString(),
        color: "Standard",
        colorCode: "#493129",
        ram: ramPart || undefined,
        storage: storagePart || undefined,
        sellingPrice: 0,
        mrp: 0,
        costPrice: 0,
        stockQuantity: 0,
        lowStockThreshold: 5,
        isActive: false
      };
    });
  } else {
    barcodeSeed++;
    const varId = `var-${p.id}-01`;
    const sku = `AC-${brand.name.toUpperCase().substring(0, 3)}-${p.id.toUpperCase().substring(0, 8)}-01`;
    variants = [{
      id: varId,
      productId: prodId,
      sku: sku,
      barcode: barcodeSeed.toString(),
      color: "Standard",
      colorCode: "#493129",
      sellingPrice: 0,
      mrp: 0,
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      isActive: false
    }];
  }

  return {
    id: prodId,
    title: p.name,
    slug: p.id,
    brandId: brand.id,
    brandName: brand.name,
    categoryId: cat.id,
    categoryName: cat.name,
    shortDescription: `${brand.name} ${p.name} with authentic manufacturer warranty. Available at Anil Communications Belagavi.`,
    description: `${p.name} by ${brand.name} in category ${cat.name}. Fully backed by official Indian warranty and service support. Awaiting pricing and stock confirmation from shop management.`,
    basePrice: 0,
    mrp: 0,
    hsnCode: cat.hsn,
    gstRate: 18.0,
    images: images,
    isFeatured: false,
    isActive: false, // Draft / Unpublished
    warrantySummary: "1 Year Official Brand Warranty",
    rating: 0,
    reviewCount: 0,
    variants: variants,
    createdAt: new Date().toISOString()
  };
});

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'lib', 'database', 'imported-catalog.json'),
  JSON.stringify(transformedProducts, null, 2),
  'utf8'
);

console.log(`Generated imported-catalog.json with ${transformedProducts.length} items!`);

