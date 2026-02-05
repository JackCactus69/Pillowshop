// Edit this file to add/remove pillow listings.
// Add photos in /assets/photos/ and set imageUrl like: "./assets/photos/linen-lumbar.jpg"
//
// If you want instant payments, set buyUrl (per product) or buyUrls (per variant key).
// Example buyUrls key format used in this site: "Size|Color|Fill"
// e.g. "12x20|Natural|Cover + Insert": "https://buy.stripe.com/xxxx"

window.PRODUCTS = [
  {
    id: "linen-lumbar",
    name: "Linen Lumbar Pillow",
    category: "Lumbar",
    description: "Clean, modern lumbar pillow with hidden zipper. Handmade in small batches.",
    materials: ["Linen blend", "Hidden zipper"],
    tags: ["minimal", "neutral", "sofa", "gift"],
    imageUrl: "",
    madeToOrder: true,
    options: {
      sizes: [
        { label: "12x20", price: 38.00 },
        { label: "14x24", price: 46.00 }
      ],
      colors: ["Natural", "Oat", "Charcoal"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Insert", delta: 12.00 }
      ]
    },
    // Optional: one buy link for the whole product (shows "Buy now")
    buyUrl: "",
    // Optional: variant-specific links
    buyUrls: {
      // "12x20|Natural|Cover + Insert": "https://buy.stripe.com/xxxx"
    }
  },
  {
    id: "velvet-throw",
    name: "Velvet Throw Pillow",
    category: "Throw",
    description: "Soft velvet throw pillow with sturdy seams and a luxe finish.",
    materials: ["Velvet", "Reinforced stitching"],
    tags: ["cozy", "living room", "bed"],
    imageUrl: "",
    madeToOrder: false,
    options: {
      sizes: [
        { label: "18x18", price: 44.00 },
        { label: "20x20", price: 52.00 }
      ],
      colors: ["Forest", "Midnight", "Terracotta"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Insert", delta: 14.00 }
      ]
    },
    buyUrl: "",
    buyUrls: {}
  },
  {
    id: "boucle-round",
    name: "Bouclé Round Pillow",
    category: "Round",
    description: "Textured bouclé round pillow — playful and plush.",
    materials: ["Bouclé", "Hidden zipper"],
    tags: ["texture", "accent", "round"],
    imageUrl: "",
    madeToOrder: true,
    options: {
      sizes: [
        { label: "14\" round", price: 42.00 },
        { label: "16\" round", price: 49.00 }
      ],
      colors: ["Cream", "Sand", "Black"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Insert", delta: 13.00 }
      ]
    },
    buyUrl: "",
    buyUrls: {}
  },
  {
    id: "outdoor-stripe",
    name: "Outdoor Stripe Pillow",
    category: "Outdoor",
    description: "Durable outdoor fabric with bold stripes. Great for patios and porches.",
    materials: ["Outdoor fabric", "Weather-resistant thread"],
    tags: ["patio", "stripe", "summer"],
    imageUrl: "",
    madeToOrder: false,
    options: {
      sizes: [
        { label: "18x18", price: 46.00 },
        { label: "20x20", price: 54.00 }
      ],
      colors: ["Navy Stripe", "Sage Stripe"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Outdoor Insert", delta: 16.00 }
      ]
    },
    buyUrl: "",
    buyUrls: {}
  },
  {
    id: "waffle-knit",
    name: "Waffle Knit Pillow",
    category: "Textured",
    description: "Waffle knit front + smooth back for a cozy layered look.",
    materials: ["Waffle knit", "Cotton backing"],
    tags: ["texture", "cozy", "neutral"],
    imageUrl: "",
    madeToOrder: true,
    options: {
      sizes: [
        { label: "16x16", price: 36.00 },
        { label: "18x18", price: 42.00 }
      ],
      colors: ["Ivory", "Stone", "Mocha"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Insert", delta: 12.00 }
      ]
    },
    buyUrl: "",
    buyUrls: {}
  },
  {
    id: "custom-fabric",
    name: "Custom Fabric Pillow (Made-to-Order)",
    category: "Custom",
    description: "Send your fabric choice and I’ll make a pillow to match your space.",
    materials: ["Your fabric choice", "Hidden zipper"],
    tags: ["custom", "made to order"],
    imageUrl: "",
    madeToOrder: true,
    options: {
      sizes: [
        { label: "18x18", price: 55.00 },
        { label: "20x20", price: 62.00 },
        { label: "12x20", price: 50.00 }
      ],
      colors: ["Customer-provided fabric"],
      fills: [
        { label: "Cover only", delta: 0.00 },
        { label: "Cover + Insert", delta: 14.00 }
      ]
    },
    buyUrl: "",
    buyUrls: {}
  }
];
