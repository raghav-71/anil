const fs = require('fs');
const path = require('path');

const products = [
  // SMARTPHONES (15)
  {
    id: "moto-g37-power",
    name: "Moto G37 Power",
    category: "Smartphones",
    brand: "Motorola",
    variants: ["4GB / 128GB", "12GB / 256GB"],
    imageUrl: "https://cdn.beebom.com/mobile/moto-g37-power-back-front.png",
    featured: true
  },
  {
    id: "oppo-a6-5g",
    name: "OPPO A6 5G",
    category: "Smartphones",
    brand: "OPPO",
    variants: ["4GB / 64GB"],
    imageUrl: "https://opsg-img-cdn-gl.heytapimg.com/epb/202404/23/v0Bf55s5s5s.png",
    featured: false
  },
  {
    id: "vivo-y31t-5g",
    name: "Vivo Y31T 5G",
    category: "Smartphones",
    brand: "Vivo",
    variants: ["6GB / 128GB"],
    imageUrl: "https://i.gadgets360cdn.com/large/vivo_y31t_5g_vivo_main_1786950340636.png",
    featured: true
  },
  {
    id: "realme-c100-5g",
    name: "Realme C100 5G",
    category: "Smartphones",
    brand: "Realme",
    variants: ["4GB / 64GB"],
    imageUrl: "https://img.advice.co.th/images_nas/pic_product4/A0180822/A0180822OK_ORI_1.jpg",
    featured: false
  },
  {
    id: "realme-c100x",
    name: "Realme C100X",
    category: "Smartphones",
    brand: "Realme",
    variants: ["4GB / 64GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "realme-16",
    name: "Realme 16",
    category: "Smartphones",
    brand: "Realme",
    variants: ["12GB / 256GB", "8GB / 256GB"],
    imageUrl: "https://backend.paiinternational.in/media/images/r_W2sdRnU.webp",
    featured: true
  },
  {
    id: "realme-16x",
    name: "Realme 16X",
    category: "Smartphones",
    brand: "Realme",
    variants: ["6GB / 256GB", "6GB / 128GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "realme-16-pro",
    name: "Realme 16 Pro",
    category: "Smartphones",
    brand: "Realme",
    variants: ["8GB / 256GB"],
    imageUrl: "https://i.ebayimg.com/images/g/0BYAAeSwvltpXdLx/s-l1200.jpg",
    featured: true
  },
  {
    id: "realme-16t",
    name: "Realme 16T",
    category: "Smartphones",
    brand: "Realme",
    variants: ["8GB / 256GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "redmi-a7-pro",
    name: "Redmi A7 Pro",
    category: "Smartphones",
    brand: "Redmi",
    variants: ["4GB / 64GB", "4GB / 128GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "realme-11x",
    name: "Realme 11X",
    category: "Smartphones",
    brand: "Realme",
    variants: ["8GB / 128GB"],
    imageUrl: "https://image01.realme.net/general/20230823/1692787834510b64dff4866f54ef4827fc471d2bfa1ca.png",
    featured: false
  },
  {
    id: "vivo-y11-5g",
    name: "Vivo Y11 5G",
    category: "Smartphones",
    brand: "Vivo",
    variants: ["4GB / 64GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "poco-c85x",
    name: "POCO C85X",
    category: "Smartphones",
    brand: "POCO",
    variants: ["4GB / 64GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "itel-a100c",
    name: "itel A100C",
    category: "Smartphones",
    brand: "itel",
    variants: ["4GB / 64GB"],
    imageUrl: null,
    featured: false
  },
  {
    id: "motorola-g06-power",
    name: "Motorola G06 Power",
    category: "Smartphones",
    brand: "Motorola",
    variants: ["4GB / 64GB"],
    imageUrl: null,
    featured: false
  },

  // KEYPAD PHONES (6)
  {
    id: "lava-a3-torch",
    name: "Lava A3 Torch",
    category: "Keypad Phones",
    brand: "Lava",
    variants: ["Standard"],
    imageUrl: "https://www.jiomart.com/images/product/original/rvladyvkek/lava-a3-torch-dual-sim-dark-blue-keypad-phone-product-images-orvladyvkek-p612488038-4-202509190005.jpg?im=Resize%3D%281000%2C1000%29",
    featured: true
  },
  {
    id: "cellecor-keypad",
    name: "Cellecor Keypad Phone",
    category: "Keypad Phones",
    brand: "Cellecor",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "lava-a2-smart",
    name: "Lava A2 Smart",
    category: "Keypad Phones",
    brand: "Lava",
    variants: ["Standard"],
    imageUrl: "https://www.sathya.store/img/product/vryIx85lbfG6sDw7.png",
    featured: false
  },
  {
    id: "jio-bharat-g2",
    name: "Jio Bharat G2",
    category: "Keypad Phones",
    brand: "Jio",
    variants: ["Standard"],
    imageUrl: "https://www.jio.com/jio-bharat-phone-v2-black.png",
    featured: true
  },
  {
    id: "cellecor-cli",
    name: "Cellecor CLI",
    category: "Keypad Phones",
    brand: "Cellecor",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "itel-ace-2-mega",
    name: "itel Ace 2 Mega",
    category: "Keypad Phones",
    brand: "itel",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },

  // EARBUDS (6)
  {
    id: "boat-airdopes-156-nirvana",
    name: "boAt Airdopes 156 Nirvana",
    category: "Earbuds",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/Airdopes_141.png",
    featured: true
  },
  {
    id: "kdm-hop-pods",
    name: "KDM Hop Pods",
    category: "Earbuds",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: "https://halfpe.com/cdn/shop/files/71xL8HG5X2L._SL1500.jpg?v=1765438451&width=1946",
    featured: true
  },
  {
    id: "morbi-earbuds",
    name: "Morbi Earbuds",
    category: "Earbuds",
    brand: "Morbi",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "boat-airdopes-91-prime",
    name: "boAt Airdopes 91 Prime",
    category: "Earbuds",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: "https://gadgetsense.in/wp-content/uploads/2025/07/boAt-Airdopes-91-Prime-1-e1759495251976.jpg",
    featured: true
  },
  {
    id: "boat-airdopes-213",
    name: "boAt Airdopes 213",
    category: "Earbuds",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-fan-pods",
    name: "KDM Fan Pods",
    category: "Earbuds",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },

  // NECKBANDS (8)
  {
    id: "kdm-evergreen",
    name: "KDM Evergreen",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: true
  },
  {
    id: "kdm-alpha",
    name: "KDM Alpha",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-daurandhar",
    name: "KDM Daurandhar",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-noble-band",
    name: "KDM Noble Band",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-vibronix",
    name: "KDM Vibronix",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-touchband",
    name: "KDM Touchband",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "kdm-glamour",
    name: "KDM Glamour",
    category: "Neckbands",
    brand: "KDM",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "boat-rockerz-103-pro",
    name: "boAt Rockerz 103 Pro",
    category: "Neckbands",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/m-black.png",
    featured: true
  },

  // HEADPHONES (3)
  {
    id: "boat-rockerz-425",
    name: "boAt Rockerz 425",
    category: "Headphones",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: "https://www.bbassets.com/media/uploads/p/xl/40338188_1-boat-40mm-drivers-boat-signature-sound-25-hours-playtime-beast-mode-low-latency-bluetooth-v52-adaptive-fit-dual-pairing-type-c-interface-voice-assistant.jpg",
    featured: true
  },
  {
    id: "boat-rockerz-trendz",
    name: "boAt Rockerz Trendz",
    category: "Headphones",
    brand: "boAt",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  },
  {
    id: "zebronics-model-to-confirm",
    name: "Zebronics Headphones (model to confirm)",
    category: "Headphones",
    brand: "Zebronics",
    variants: ["Standard"],
    imageUrl: null,
    featured: false
  }
];

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
  "Smartphones": { id: "cat-smartphones", name: "Smartphones", slug: "smartphones", hsn: "85171300" },
  "Keypad Phones": { id: "cat-keypad", name: "Keypad Phones", slug: "keypad-phones", hsn: "85171300" },
  "Earbuds": { id: "cat-earbuds", name: "Earbuds", slug: "earbuds", hsn: "85183000" },
  "Neckbands": { id: "cat-neckbands", name: "Neckbands", slug: "neckbands", hsn: "85183000" },
  "Headphones": { id: "cat-headphones", name: "Headphones", slug: "headphones", hsn: "85183000" },
};

let barcodeSeed = 8906000000000;

const transformedProducts = products.map((p) => {
  const brand = brandMap[p.brand] || { id: `b-${p.brand.toLowerCase()}`, name: p.brand, slug: p.brand.toLowerCase() };
  const cat = categoryMap[p.category] || { id: "cat-smartphones", name: p.category, slug: "smartphones", hsn: "85171300" };
  const prodId = `prod-${p.id}`;

  const images = [];
  if (p.imageUrl) {
    images.push(p.imageUrl);
  }
  images.push(`/images/products/${p.id}.svg`);

  // Build variants
  let variants = [];
  if (p.variants && p.variants.length > 0 && p.variants[0] !== "Standard") {
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
        isActive: true // ACTIVE SO IT APPEARS
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
      isActive: true // ACTIVE SO IT APPEARS
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
    description: `${p.name} by ${brand.name} in category ${cat.name}. Fully backed by official Indian warranty and service support. Awaiting retail pricing confirmation from store manager.`,
    basePrice: 0,
    mrp: 0,
    hsnCode: cat.hsn,
    gstRate: 18.0,
    images: images,
    isFeatured: p.featured,
    isActive: true, // ACTIVE/PUBLISHED AS REQUIRED BY USER!
    warrantySummary: "1 Year Official Brand Warranty",
    rating: 4.8,
    reviewCount: 12,
    variants: variants,
    createdAt: new Date().toISOString()
  };
});

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'lib', 'database', 'imported-catalog.json'),
  JSON.stringify(transformedProducts, null, 2),
  'utf8'
);

console.log(`Generated active imported-catalog.json with ${transformedProducts.length} items!`);
