export interface ServiceStyle {
  slug: string;
  name: string;
  description: string;
  price: string;
  /** Optional VIP-tier price for this same style. Surfaced in the "VIP" section. */
  vipPrice?: string;
  duration: string;
  imageUrl: string;
  /** Additional gallery images for the carousel. The primary `imageUrl` stays the cover. */
  images?: string[];
  options?: {
    lengths?: string[];
    colors?: string[];
    types?: string[];
  };
}

export interface Service {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  styles: ServiceStyle[];
}

export const allServices: Service[] = [
  {
    slug: "braiding",
    name: "Braiding",
    description:
      "Professional braiding services using premium Solita extensions. From knotless braids to French curls, our expert braiders deliver flawless results every time.",
    imageUrl: "/images/products/french-curls-honey-cocoa.jpg",
    styles: [
      {
        slug: "knotless-braids",
        name: "Knotless Braids",
        description: "Lightweight, tension-free braids for a natural look and comfortable wear. Less pulling on your scalp with a seamless finish.",
        price: "From $80",
        vipPrice: "From $140",
        duration: "3-5 hours",
        imageUrl: "/images/products/french-curls-ginger-spice.jpg",
        options: {
          lengths: ["Waist Length", "Mid-Back", "Hip Length"],
          colors: ["Black", "Brown", "Blonde", "Ombré", "Custom Color"],
          types: ["Small", "Medium", "Large", "Jumbo"],
        },
      },
      {
        slug: "box-braids",
        name: "Box Braids",
        description: "Classic box braids with clean parts and uniform sections. A timeless protective style that lasts 6-8 weeks.",
        price: "From $70",
        vipPrice: "From $125",
        duration: "4-6 hours",
        imageUrl: "/images/products/french-curls-cinnamon-ombre.jpg",
        options: {
          lengths: ["Shoulder Length", "Mid-Back", "Waist Length", "Hip Length"],
          colors: ["Black", "Dark Brown", "Burgundy", "Blonde", "Custom Color"],
          types: ["Small", "Medium", "Large"],
        },
      },
      {
        slug: "french-curls-install",
        name: "French Curls Install",
        description: "Trendy French curl braids using premium Solita French Curls extensions. Bouncy, defined curls with a bohemian finish.",
        price: "From $100",
        vipPrice: "From $170",
        duration: "4-6 hours",
        imageUrl: "/images/products/french-curls-honey-cocoa.jpg",
        options: {
          lengths: ["16 inches", "18 inches", "24 inches", "30 inches"],
          colors: ["Honey Cocoa", "Ginger Spice", "Onyx Black", "Cinnamon Ombré", "Platinum Barbie", "Custom"],
        },
      },
      {
        slug: "boho-braids",
        name: "Boho Braids",
        description: "Effortless bohemian-style braids with loose, wavy ends for a carefree, romantic look. Perfect for any occasion.",
        price: "From $120",
        vipPrice: "From $200",
        duration: "5-7 hours",
        imageUrl: "/images/products/boho-beach-wave-hazel-brownie.jpg",
        options: {
          lengths: ["16 inches", "18 inches", "24 inches", "30 inches"],
          colors: ["Hazel Brownie", "Cocoa Latte", "Caramel", "Mocha", "Black", "Custom"],
        },
      },
      {
        slug: "cornrows",
        name: "Cornrows",
        description: "Sleek, flat braids close to the scalp in various patterns. From straight-backs to creative designs.",
        price: "From $50",
        vipPrice: "From $90",
        duration: "2-4 hours",
        imageUrl: "/images/products/bone-straight-onyx-black.jpg",
        options: {
          types: ["Straight Back", "Feed-In", "Zig-Zag", "Custom Design"],
        },
      },
      {
        slug: "goddess-locs",
        name: "Goddess Locs",
        description: "Soft, distressed faux locs with curly accents for a bohemian goddess look. Lightweight and versatile.",
        price: "From $90",
        vipPrice: "From $160",
        duration: "4-6 hours",
        imageUrl: "/images/products/deep-wave-cinnamon-mocha-darker-shade.jpg",
        options: {
          lengths: ["Shoulder Length", "Mid-Back", "Waist Length"],
          colors: ["Black", "Dark Brown", "Burgundy", "Ombré"],
        },
      },
    ],
  },
  {
    slug: "makeup",
    name: "Makeup",
    description:
      "From everyday glam to bridal looks, our makeup artists create stunning, long-lasting looks tailored to your style and skin tone.",
    imageUrl: "/images/products/cambodian-wavy-custom-burgundy.jpg",
    styles: [
      {
        slug: "full-glam",
        name: "Full Glam",
        description: "Full-face makeup with lashes, contour, and highlight for a show-stopping look. Perfect for events and special occasions.",
        price: "From $60",
        duration: "1-1.5 hours",
        imageUrl: "/images/products/cambodian-wavy-custom-burgundy.jpg",
      },
      {
        slug: "bridal-makeup",
        name: "Bridal Makeup",
        description: "Long-lasting, photo-ready bridal makeup with pre-wedding trial included. Your perfect look for the big day.",
        price: "From $150",
        duration: "2-3 hours",
        imageUrl: "/images/products/boho-beach-wave-caramel.jpg",
      },
      {
        slug: "soft-glam",
        name: "Soft Glam",
        description: "Natural, everyday makeup with a polished finish. Enhanced beauty without the heavy look.",
        price: "From $45",
        duration: "45 min - 1 hour",
        imageUrl: "/images/products/boho-beach-wave-chocolate-mocha.jpg",
      },
      {
        slug: "editorial-photoshoot",
        name: "Editorial / Photoshoot",
        description: "Creative, editorial-style makeup for photo shoots, campaigns, and content creation.",
        price: "From $80",
        duration: "1.5-2 hours",
        imageUrl: "/images/products/boho-beach-wave-mocha.jpg",
      },
    ],
  },
  {
    slug: "lashes",
    name: "Lashes",
    description:
      "Enhance your natural beauty with our premium lash services. Choose from classic, volume, or mega volume sets for the perfect flutter.",
    imageUrl: "/images/products/kinky-curly-honey-maple.jpg",
    styles: [
      {
        slug: "classic-set",
        name: "Classic Set",
        description: "One extension per natural lash for a subtle, natural enhancement. Perfect for first-timers.",
        price: "From $40",
        duration: "1.5-2 hours",
        imageUrl: "/images/products/kinky-curly-honey-maple.jpg",
      },
      {
        slug: "volume-set",
        name: "Volume Set",
        description: "Multiple lightweight extensions per natural lash for a fuller, more dramatic look.",
        price: "From $55",
        duration: "2-2.5 hours",
        imageUrl: "/images/products/french-curls-platinum-barbie.jpg",
      },
      {
        slug: "mega-volume",
        name: "Mega Volume",
        description: "Maximum fullness with ultra-fine extensions for the most dramatic, glamorous lash look.",
        price: "From $70",
        duration: "2.5-3 hours",
        imageUrl: "/images/products/french-curls-amaka-blonde.jpg",
      },
      {
        slug: "lash-lift-tint",
        name: "Lash Lift & Tint",
        description: "Lift and curl your natural lashes with a semi-permanent perm and tint. No extensions needed.",
        price: "From $35",
        duration: "45 min - 1 hour",
        imageUrl: "/images/products/french-curls-velvet.jpg",
      },
      {
        slug: "lash-refill",
        name: "Refill",
        description: "Maintenance fill for existing lash extensions. Recommended every 2-3 weeks.",
        price: "From $25",
        duration: "1-1.5 hours",
        imageUrl: "/images/products/french-curls-caramel-blonde.jpg",
      },
    ],
  },
  {
    slug: "microshading",
    name: "Microshading",
    description:
      "Semi-permanent brow enhancement using a gentle stippling technique for a soft, powdered finish. Perfect for fuller, defined brows that last.",
    imageUrl: "/images/products/boho-beach-wave-caramel.jpg",
    styles: [
      {
        slug: "full-microshading",
        name: "Full Microshading",
        description: "Powder-effect brows using a stippling technique for a soft, filled-in look that lasts 1-2 years.",
        price: "From $200",
        duration: "2-3 hours",
        imageUrl: "/images/products/boho-beach-wave-caramel.jpg",
      },
      {
        slug: "microblading",
        name: "Microblading",
        description: "Hair-like strokes for natural-looking brows. Ideal for sparse or thin brows.",
        price: "From $180",
        duration: "2-3 hours",
        imageUrl: "/images/products/boho-beach-wave-hazel-brownie.jpg",
      },
      {
        slug: "combo-brows",
        name: "Combo Brows",
        description: "Best of both worlds — microblading strokes in the front with microshading fill in the body and tail.",
        price: "From $220",
        duration: "2.5-3 hours",
        imageUrl: "/images/products/boho-beach-wave-chocolate-caramel.jpg",
      },
      {
        slug: "brow-touch-up",
        name: "Touch Up (4-6 weeks)",
        description: "Follow-up session to perfect color retention and shape. Required 4-6 weeks after initial session.",
        price: "From $80",
        duration: "1-1.5 hours",
        imageUrl: "/images/products/boho-beach-wave-cocoa-latte.jpg",
      },
    ],
  },
  {
    slug: "waxing",
    name: "Waxing",
    description:
      "Smooth, long-lasting hair removal using premium wax for a comfortable experience. We offer full body and facial waxing services.",
    imageUrl: "/images/products/textured-straight-maple-mocha.jpg",
    styles: [
      {
        slug: "full-legs",
        name: "Full Legs",
        description: "Complete leg waxing from ankle to upper thigh for silky smooth results lasting 3-6 weeks.",
        price: "From $40",
        duration: "30-45 min",
        imageUrl: "/images/products/textured-straight-maple-mocha.jpg",
      },
      {
        slug: "brazilian",
        name: "Brazilian",
        description: "Full bikini area wax for a clean, smooth finish. Our experienced estheticians ensure comfort.",
        price: "From $45",
        duration: "30-45 min",
        imageUrl: "/images/products/bone-straight-platinum-strawberry-blonde.jpg",
      },
      {
        slug: "bikini-line",
        name: "Bikini Line",
        description: "Neat, clean wax along the bikini line for a tidy look.",
        price: "From $25",
        duration: "15-20 min",
        imageUrl: "/images/products/bone-straight-honey-cocoa.jpg",
      },
      {
        slug: "underarms",
        name: "Underarms",
        description: "Quick and effective underarm waxing for smooth, hair-free results.",
        price: "From $15",
        duration: "10-15 min",
        imageUrl: "/images/products/bone-straight-grey-ombre.jpg",
      },
      {
        slug: "full-face",
        name: "Full Face",
        description: "Eyebrows, upper lip, chin, and sideburns — everything for a polished look.",
        price: "From $20",
        duration: "15-20 min",
        imageUrl: "/images/products/bone-straight-cinnamon-ombre.jpg",
      },
      {
        slug: "full-body",
        name: "Full Body",
        description: "Complete body waxing package. Legs, arms, bikini, underarms, and face.",
        price: "From $100",
        duration: "1.5-2 hours",
        imageUrl: "/images/products/bone-straight-ayya-ombre.jpg",
      },
    ],
  },
  {
    slug: "nails",
    name: "Nails",
    description:
      "Express yourself with our nail artistry. From classic manicures to intricate nail art, we create beautiful, long-lasting nails.",
    imageUrl: "/images/products/raw-cambodian-curly-cocoa-mocha.jpg",
    styles: [
      {
        slug: "gel-manicure",
        name: "Gel Manicure",
        description: "Long-lasting gel polish manicure with nail shaping, cuticle care, and a flawless finish.",
        price: "From $30",
        duration: "45 min - 1 hour",
        imageUrl: "/images/products/raw-cambodian-curly-cocoa-mocha.jpg",
      },
      {
        slug: "acrylic-full-set",
        name: "Acrylic Full Set",
        description: "Full set of acrylic nail extensions with your choice of shape, length, and color.",
        price: "From $45",
        duration: "1.5-2 hours",
        imageUrl: "/images/products/french-curls-ruby-merlot.jpg",
        options: {
          lengths: ["Short", "Medium", "Long", "Extra Long"],
          types: ["Coffin", "Stiletto", "Square", "Almond", "Oval"],
        },
      },
      {
        slug: "acrylic-fill",
        name: "Acrylic Fill",
        description: "Maintenance fill for existing acrylic nails. Recommended every 2-3 weeks.",
        price: "From $30",
        duration: "1-1.5 hours",
        imageUrl: "/images/products/french-curls-strawberry-blonde.jpg",
      },
      {
        slug: "nail-art",
        name: "Nail Art (per nail)",
        description: "Custom nail art designs — from minimalist lines to intricate hand-painted masterpieces.",
        price: "From $5",
        duration: "Varies",
        imageUrl: "/images/products/french-curls-platinum-pink-berry-blonde.jpg",
      },
      {
        slug: "pedicure",
        name: "Pedicure",
        description: "Relaxing pedicure with foot soak, exfoliation, nail shaping, and polish.",
        price: "From $35",
        duration: "1-1.5 hours",
        imageUrl: "/images/products/french-curls-cocoa-ginger.jpg",
      },
      {
        slug: "gel-removal",
        name: "Gel Removal",
        description: "Safe, gentle removal of gel or acrylic nails without damaging your natural nails.",
        price: "$10",
        duration: "20-30 min",
        imageUrl: "/images/products/french-curls-icy-platinum.jpg",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return allServices.find((s) => s.slug === slug);
}

export function getStyleBySlug(
  serviceSlug: string,
  styleSlug: string,
): ServiceStyle | undefined {
  const service = getServiceBySlug(serviceSlug);
  return service?.styles.find((s) => s.slug === styleSlug);
}
