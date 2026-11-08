const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function getIconSvg(category) {
  if (category === 'Smartphones') {
    return `
      <!-- Smartphone Silhouette -->
      <rect x="135" y="60" width="130" height="230" rx="20" fill="#fff" stroke="#493129" stroke-width="2.5" />
      <rect x="145" y="75" width="110" height="200" rx="12" fill="#ffeedb" />
      <circle cx="200" cy="70" r="3" fill="#8b597b" />
      <line x1="180" y1="265" x2="220" y2="265" stroke="#8b597b" stroke-width="2.5" stroke-linecap="round" />
    `;
  }
  if (category === 'Keypad Phones') {
    return `
      <!-- Keypad Phone Silhouette -->
      <rect x="145" y="55" width="110" height="240" rx="16" fill="#fff" stroke="#493129" stroke-width="2.5" />
      <rect x="155" y="70" width="90" height="85" rx="6" fill="#ffdec7" />
      <!-- D-Pad -->
      <circle cx="200" cy="180" r="14" fill="#8b597b" />
      <circle cx="200" cy="180" r="6" fill="#fff" />
      <!-- Numeric Grid -->
      <rect x="160" y="206" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="190" y="206" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="220" y="206" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="160" y="226" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="190" y="226" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="220" y="226" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="160" y="246" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="190" y="246" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="220" y="246" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
      <rect x="190" y="266" width="20" height="12" rx="3" fill="#493129" opacity="0.6" />
    `;
  }
  if (category === 'Earbuds') {
    return `
      <!-- TWS Earbuds Silhouette -->
      <ellipse cx="200" cy="190" rx="55" ry="40" fill="#fff" stroke="#493129" stroke-width="2.5" />
      <path d="M145,190 Q200,165 255,190" fill="none" stroke="#efa3a0" stroke-width="2" />
      <circle cx="200" cy="205" r="3" fill="#8b597b" />
      <!-- Earbud Left -->
      <ellipse cx="165" cy="120" rx="14" ry="20" fill="#8b597b" transform="rotate(-15 165 120)" />
      <rect x="162" y="135" width="6" height="30" rx="3" fill="#493129" transform="rotate(-15 165 145)" />
      <!-- Earbud Right -->
      <ellipse cx="235" cy="120" rx="14" ry="20" fill="#8b597b" transform="rotate(15 235 120)" />
      <rect x="232" y="135" width="6" height="30" rx="3" fill="#493129" transform="rotate(15 235 145)" />
    `;
  }
  if (category === 'Neckbands') {
    return `
      <!-- Neckband Silhouette -->
      <path d="M120,240 C110,130 290,130 280,240" fill="none" stroke="#493129" stroke-width="6" stroke-linecap="round" />
      <rect x="110" y="210" width="20" height="50" rx="8" fill="#8b597b" />
      <rect x="270" y="210" width="20" height="50" rx="8" fill="#8b597b" />
      <path d="M120,260 C120,285 145,260 145,230" fill="none" stroke="#efa3a0" stroke-width="2.5" />
      <ellipse cx="145" cy="225" rx="8" ry="12" fill="#493129" />
      <path d="M280,260 C280,285 255,260 255,230" fill="none" stroke="#efa3a0" stroke-width="2.5" />
      <ellipse cx="255" cy="225" rx="8" ry="12" fill="#493129" />
    `;
  }
  if (category === 'Headphones') {
    return `
      <!-- Headphones Silhouette -->
      <path d="M125,180 C125,85 275,85 275,180" fill="none" stroke="#493129" stroke-width="7" stroke-linecap="round" />
      <rect x="110" y="160" width="28" height="55" rx="12" fill="#8b597b" stroke="#493129" stroke-width="2" />
      <rect x="262" y="160" width="28" height="55" rx="12" fill="#8b597b" stroke="#493129" stroke-width="2" />
      <circle cx="124" cy="187" r="6" fill="#ffdec7" />
      <circle cx="276" cy="187" r="6" fill="#ffdec7" />
    `;
  }
  return '';
}

function generateSvgCard(product) {
  const icon = getIconSvg(product.category);
  const cleanTitle = product.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanBrand = product.brand.toUpperCase();
  const cleanCategory = product.category.toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffaf5" />
      <stop offset="100%" stop-color="#ffeedb" />
    </linearGradient>
    <radialGradient id="peachGlow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#ffdec7" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ffdec7" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" rx="24" fill="url(#bgGrad)" stroke="#493129" stroke-opacity="0.08" stroke-width="1.5" />
  <circle cx="200" cy="170" r="120" fill="url(#peachGlow)" />

  <!-- Device Artwork -->
  ${icon}

  <!-- Brand Eyebrow -->
  <text x="200" y="325" text-anchor="middle" font-family="'DM Sans', sans-serif" font-size="11" font-weight="700" letter-spacing="2.5" fill="#8b597b">
    ${cleanBrand} · ${cleanCategory}
  </text>

  <!-- Product Name -->
  <text x="200" y="352" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="17" font-weight="600" fill="#493129">
    ${cleanTitle}
  </text>

  <!-- Store Tag -->
  <text x="200" y="375" text-anchor="middle" font-family="'DM Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" fill="#efa3a0">
    ANIL COMMUNICATIONS · AUTHENTIC RETAIL
  </text>
</svg>`;
}

// Read products
const productsFile = path.join(__dirname, '..', 'catalog_temp', 'anil-communications-catalog', 'src', 'data', 'products.ts');
const content = fs.readFileSync(productsFile, 'utf8');

const jsonMatch = content.match(/export const products: StoreProduct\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  console.error("Could not parse products.ts");
  process.exit(1);
}

// Clean trailing commas before parsing
const jsonStr = jsonMatch[1].replace(/,\s*([\]}])/g, '$1');
const products = JSON.parse(jsonStr);
console.log(`Generating placeholder SVGs for ${products.length} products...`);

products.forEach(p => {
  const svg = generateSvgCard(p);
  const outPath = path.join(targetDir, `${p.id}.svg`);
  fs.writeFileSync(outPath, svg, 'utf8');
});

console.log("Successfully generated all 38 luxury SVGs in public/images/products!");
