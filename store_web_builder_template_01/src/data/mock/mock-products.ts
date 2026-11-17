import type { ProductDTO, ProductCategoryDTO } from "@/types";

export const MOCK_CATEGORIES: ProductCategoryDTO[] = [
  {
    id: "cat_electronics",
    name: "Electronics & Audio",
    slug: "electronics",
    description: "Precision engineered acoustics, wireless audio, and intelligent personal hardware.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
    productCount: 4,
  },
  {
    id: "cat_workspace",
    name: "Workspace & Office",
    slug: "workspace",
    description: "Minimalist ergonomic desks, mechanical keyboards, and architectural desktop accessories.",
    imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1000&auto=format&fit=crop&q=80",
    productCount: 3,
  },
  {
    id: "cat_apparel",
    name: "Apparel & Carry",
    slug: "apparel-lifestyle",
    description: "Technical fabrics, weather-resistant commuter packs, and refined everyday essentials.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80",
    productCount: 3,
  },
];

export const MOCK_PRODUCTS: ProductDTO[] = [
  {
    id: "prod_01",
    storeId: "store_[STORE_SLUG]_01",
    title: "Aura Pro Wireless ANC Studio Headphones",
    slug: "aura-pro-wireless-headphones",
    shortDescription: "Flagship wireless headphones featuring hybrid active noise cancellation and 48-hour endurance.",
    description: `
<h3>Uncompromising Acoustic Fidelity</h3>
<p>Crafted for discerning audio professionals and everyday audiophiles, the <strong>Aura Pro Wireless</strong> merges custom 40mm beryllium diaphragm drivers with cutting-edge hybrid active noise cancellation (ANC).</p>

<h4>Key Technical Highlights</h4>
<ul>
  <li><strong>Studio-Grade Drivers:</strong> 40mm custom beryllium coated acoustic chambers tuned for neutral, transparent frequency response.</li>
  <li><strong>Adaptive ANC Matrix:</strong> Four dedicated feed-forward and feed-backward microphones sampling ambient frequencies at 48,000 times per second.</li>
  <li><strong>Lossless Hi-Res Audio:</strong> Support for LDAC, aptX Adaptive, and AAC codecs with uncompressed 24-bit / 96kHz wireless throughput.</li>
  <li><strong>Ultra-Low Latency Mode:</strong> Dedicated 32ms low-latency gaming and film transmission channel.</li>
</ul>

<h4>Materials & Craftsmanship</h4>
<p>Built with lightweight aerospace aluminum yokes, breathable memory foam cushions wrapped in supple vegan protein leather, and a magnetic swappable earpad architecture designed for decade-long longevity.</p>
    `.trim(),
    price: 299.99,
    compareAtPrice: 349.99,
    costPerItem: 140.0,
    sku: "AURA-ANC-BLK",
    barcode: "840192837401",
    stockQuantity: 42,
    isAvailable: true,
    isFeatured: true,
    categories: [MOCK_CATEGORIES[0]],
    tags: ["audio", "wireless", "headphones", "anc", "bestseller"],
    images: [
      {
        id: "img_01_a",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
        altText: "Aura Pro Wireless Headphones in Matte Obsidian",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: "img_01_b",
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&auto=format&fit=crop&q=80",
        altText: "Aura Pro Headphones Ear Cup Acoustic Detail",
        isPrimary: false,
        sortOrder: 2,
      },
      {
        id: "img_01_c",
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80",
        altText: "Aura Pro resting flat with aluminum gimbal design",
        isPrimary: false,
        sortOrder: 3,
      },
    ],
    variants: [
      {
        id: "var_01_obsidian",
        productId: "prod_01",
        sku: "AURA-ANC-OBS",
        title: "Obsidian Black",
        price: 299.99,
        compareAtPrice: 349.99,
        stock: 28,
        attributes: { Color: "Obsidian Black" },
        isAvailable: true,
      },
      {
        id: "var_01_silver",
        productId: "prod_01",
        sku: "AURA-ANC-SLV",
        title: "Lunar Titanium",
        price: 299.99,
        compareAtPrice: 349.99,
        stock: 14,
        attributes: { Color: "Lunar Titanium" },
        isAvailable: true,
      },
    ],
    averageRating: 4.9,
    totalReviews: 128,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "prod_02",
    storeId: "store_[STORE_SLUG]_01",
    title: "OmniDesk Pro Solid Bamboo Standing Desk",
    slug: "omnidesk-pro-solid-bamboo-desk",
    shortDescription: "Commercial-grade dual motor adjustable standing desk crafted from 100% sustainable bamboo.",
    description: `
<h3>Engineered for Posture, Built to Last</h3>
<p>The <strong>OmniDesk Pro</strong> elevates your home studio or executive office with whisper-quiet dual synchronized lifting columns and a hand-finished 100% sustainable carbonized bamboo desktop.</p>

<h4>Performance Specifications</h4>
<ul>
  <li><strong>Dual Whisper Motors:</strong> Smooth height travel speed of 38mm/sec with acoustic signature under 45 decibels.</li>
  <li><strong>Generous Lifting Capacity:</strong> Rated for up to 125kg (275 lbs) of desktop gear and multi-monitor setups.</li>
  <li><strong>Smart OLED Keypad:</strong> 4 programmable memory presets, integrated anti-collision gyroscope, and 18W USB-C fast charging port.</li>
  <li><strong>Cable Management Raceway:</strong> Concealed underside steel channels for complete wire invisibility.</li>
</ul>
    `.trim(),
    price: 649.0,
    compareAtPrice: 749.0,
    costPerItem: 310.0,
    sku: "DESK-BAM-140",
    stockQuantity: 18,
    isAvailable: true,
    isFeatured: true,
    categories: [MOCK_CATEGORIES[1]],
    tags: ["desk", "ergonomics", "furniture", "workspace", "featured"],
    images: [
      {
        id: "img_02_a",
        url: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1000&auto=format&fit=crop&q=80",
        altText: "Solid Bamboo Standing Desk in clean natural daylight office",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: "img_02_b",
        url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&auto=format&fit=crop&q=80",
        altText: "Desk surface detail and minimalist workspace accessories",
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    variants: [
      {
        id: "var_02_140",
        productId: "prod_02",
        sku: "DESK-BAM-140",
        title: '55" x 28" (Standard)',
        price: 649.0,
        stock: 12,
        attributes: { Size: '55" x 28"' },
        isAvailable: true,
      },
      {
        id: "var_02_160",
        productId: "prod_02",
        sku: "DESK-BAM-160",
        title: '63" x 30" (Executive)',
        price: 729.0,
        compareAtPrice: 829.0,
        stock: 6,
        attributes: { Size: '63" x 30"' },
        isAvailable: true,
      },
    ],
    averageRating: 4.8,
    totalReviews: 86,
    createdAt: "2026-01-20T10:00:00.000Z",
    updatedAt: "2026-02-05T12:00:00.000Z",
  },
  {
    id: "prod_03",
    storeId: "store_[STORE_SLUG]_01",
    title: "Verve 75% CNC Wireless Mechanical Keyboard",
    slug: "verve-75-cnc-mechanical-keyboard",
    shortDescription: "Gasket-mounted CNC aluminum wireless keyboard with hot-swappable switches and PBT keycaps.",
    description: `
<h3>Tactile Precision Meets Acoustic Refinement</h3>
<p>Precision-machined from a solid block of 6063 aerospace aluminum, the <strong>Verve 75</strong> features a custom silicone gasket-mount configuration that eliminates ping and yields a satisfying, deep acoustic signature.</p>

<h4>Craftsmanship Specs</h4>
<ul>
  <li><strong>Chassis:</strong> Anodized sandblasted 6063 aluminum case with brass internal counterweight.</li>
  <li><strong>Connectivity:</strong> Tri-mode wireless (Bluetooth 5.2, 2.4GHz low latency dongle, USB-C wired).</li>
  <li><strong>Hot-Swap PCB:</strong> Universal 5-pin south-facing sockets compatible with Cherry, Gateron, and Kailh switches.</li>
  <li><strong>Sound Dampening:</strong> Poron plate foam, IXPE switch pads, and acoustic silicone base dampener.</li>
</ul>
    `.trim(),
    price: 189.0,
    compareAtPrice: 219.0,
    sku: "KB-VERVE-75",
    stockQuantity: 35,
    isAvailable: true,
    isFeatured: true,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[1]],
    tags: ["keyboard", "mechanical", "wireless", "gadget", "workspace"],
    images: [
      {
        id: "img_03_a",
        url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80",
        altText: "Verve 75 Percent Mechanical Keyboard top view",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: "img_03_b",
        url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&auto=format&fit=crop&q=80",
        altText: "PBT keycap angle detail and RGB underglow",
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    variants: [
      {
        id: "var_03_tactile",
        productId: "prod_03",
        sku: "KB-VERVE-75-TAC",
        title: "Gateron Brown (Tactile)",
        price: 189.0,
        stock: 20,
        attributes: { Switch: "Tactile Brown" },
        isAvailable: true,
      },
      {
        id: "var_03_linear",
        productId: "prod_03",
        sku: "KB-VERVE-75-LIN",
        title: "Gateron Red (Linear)",
        price: 189.0,
        stock: 15,
        attributes: { Switch: "Linear Red" },
        isAvailable: true,
      },
    ],
    averageRating: 4.9,
    totalReviews: 64,
    createdAt: "2026-01-22T10:00:00.000Z",
    updatedAt: "2026-02-08T12:00:00.000Z",
  },
  {
    id: "prod_04",
    storeId: "store_[STORE_SLUG]_01",
    title: "Apex Waterproof Technical Commuter Backpack 24L",
    slug: "apex-technical-commuter-backpack",
    shortDescription: "Weatherproof 24-liter everyday backpack made with recycled X-Pac fabric and modular compartments.",
    description: `
<h3>Engineered Weather Protection for the Urban Commuter</h3>
<p>Designed for all-weather commuters and mobile creators, the <strong>Apex 24L Backpack</strong> combines ultralight laminated sailcloth with YKK AquaGuard watertight zippers.</p>

<h4>Storage & Ergonomics</h4>
<ul>
  <li><strong>Suspended Tech Compartment:</strong> Dedicated padded sleeve fits laptops up to 16-inch with false-bottom drop protection.</li>
  <li><strong>Clamshell 180° Access:</strong> Pack lay-flat design for rapid airport security screening and organized packing.</li>
  <li><strong>Ergonomic Harness:</strong> Contoured EVA foam back panel with airflow channels and magnetic sternum clasp.</li>
</ul>
    `.trim(),
    price: 175.0,
    compareAtPrice: 195.0,
    sku: "BP-APEX-24L-GRY",
    stockQuantity: 24,
    isAvailable: true,
    isFeatured: true,
    categories: [MOCK_CATEGORIES[2]],
    tags: ["backpack", "travel", "commute", "waterproof", "apparel"],
    images: [
      {
        id: "img_04_a",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80",
        altText: "Apex Technical Commuter Backpack in Slate Grey",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: "img_04_b",
        url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1000&auto=format&fit=crop&q=80",
        altText: "Backpack side profile and weather-resistant zipper seams",
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    variants: [],
    averageRating: 4.7,
    totalReviews: 48,
    createdAt: "2026-01-25T10:00:00.000Z",
    updatedAt: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "prod_05",
    storeId: "store_[STORE_SLUG]_01",
    title: "Minimalist Merino Wool Overshirt",
    slug: "minimalist-merino-wool-overshirt",
    shortDescription: "Thermoregulating 100% ultrafine merino wool tailored overshirt for year-round layering.",
    description: `
<h3>Naturally Odor-Resistant, Timelessly Tailored</h3>
<p>Woven from 240gsm ultrafine Australian merino wool, this overshirt combines the structured drape of a tailored jacket with the breathability of athletic knitwear.</p>

<h4>Garment Highlights</h4>
<ul>
  <li>100% natural, biodegradable 18.5-micron merino wool.</li>
  <li>Matte horn-finish Corozo buttons sustainably harvested from palm nuts.</li>
  <li>Internal hidden passport and phone pocket.</li>
</ul>
    `.trim(),
    price: 145.0,
    compareAtPrice: null,
    sku: "APP-MERINO-OSH",
    stockQuantity: 19,
    isAvailable: true,
    isFeatured: false,
    categories: [MOCK_CATEGORIES[2]],
    tags: ["apparel", "merino", "overshirt", "wool"],
    images: [
      {
        id: "img_05_a",
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1000&auto=format&fit=crop&q=80",
        altText: "Merino wool overshirt in charcoal heather",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [],
    averageRating: 4.8,
    totalReviews: 32,
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: "2026-02-12T12:00:00.000Z",
  },
  {
    id: "prod_06",
    storeId: "store_[STORE_SLUG]_01",
    title: "Lumix Studio Desktop Monitor Light Bar",
    slug: "lumix-studio-monitor-light-bar",
    shortDescription: "Zero-glare asymmetrical desk light bar with wireless desktop dial and CRI 95+ LEDs.",
    description: `
<h3>Asymmetrical Glare-Free Workspace Illumination</h3>
<p>Engineered to clip directly onto curved or flat monitors without blocking webcams. Casts wide, even light across your desktop while keeping screen glare to 0%.</p>
<ul>
  <li>Ra95 High Color Rendering Index for accurate color correction and reduced eye fatigue.</li>
  <li>Wireless 2.4GHz circular metal desk dial for stepless brightness and color temperature adjustment (2700K - 6500K).</li>
</ul>
    `.trim(),
    price: 89.0,
    compareAtPrice: 109.0,
    sku: "LGT-MON-BAR-BLK",
    stockQuantity: 50,
    isAvailable: true,
    isFeatured: false,
    categories: [MOCK_CATEGORIES[0], MOCK_CATEGORIES[1]],
    tags: ["lighting", "monitor", "workspace", "productivity"],
    images: [
      {
        id: "img_06_a",
        url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80",
        altText: "Minimalist desk setup illuminated by monitor light bar",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [],
    averageRating: 4.6,
    totalReviews: 41,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-14T12:00:00.000Z",
  },
];
