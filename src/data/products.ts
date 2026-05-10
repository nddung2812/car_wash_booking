export type ProductCategory = "wash" | "interior" | "wax-polish" | "accessories";
export type ProductBadge = "Best seller" | "New" | "Staff pick";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  wash: "Wash",
  interior: "Interior",
  "wax-polish": "Wax & Polish",
  accessories: "Accessories",
};

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  category: ProductCategory;
  description: string;
  features: string[];
  image: string;
  badge?: ProductBadge;
  inStock: boolean;
}

const UNSPLASH_PARAMS = "?w=1200&auto=format&fit=crop&q=80";

export const products: Product[] = [
  {
    id: "premium-foam-shampoo-1l",
    name: "Premium Foam Shampoo 1L",
    tagline: "pH-neutral wash concentrate for safe, slick suds.",
    price: 29,
    category: "wash",
    description:
      "Highly concentrated, pH-neutral car shampoo that lifts road grime without stripping wax or sealant.",
    features: [
      "Safe on wax & ceramic coatings",
      "Up to 25 washes per bottle",
      "Cherry-almond scent",
    ],
    image: `https://images.unsplash.com/photo-1601362840469-51e4d8d58785${UNSPLASH_PARAMS}`,
    inStock: true,
  },
  {
    id: "microfiber-drying-towel-xl",
    name: "Microfiber Drying Towel (XL)",
    tagline: "1200gsm twisted-loop — dry the whole car in two passes.",
    price: 24,
    category: "accessories",
    description:
      "Ultra-plush twisted-loop microfiber that drinks water without dragging or marring paint.",
    features: [
      "60 × 90 cm — covers a full panel",
      "Lint-free, edgeless construction",
      "Machine washable",
    ],
    image: `https://images.unsplash.com/photo-1520340356584-f9917d1eea6f${UNSPLASH_PARAMS}`,
    inStock: true,
  },
  {
    id: "carnauba-spray-wax-500ml",
    name: "Carnauba Spray Wax 500ml",
    tagline: "Quick-detail gloss between full washes.",
    price: 32,
    category: "wax-polish",
    description:
      "Brazilian carnauba spray wax that lays down a glassy, water-beading finish in minutes.",
    features: [
      "Spray on, wipe off — no buffing",
      "Adds 4–6 weeks of protection",
      "Layers safely over sealant",
    ],
    image: `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2${UNSPLASH_PARAMS}`,
    badge: "Best seller",
    inStock: true,
  },
  {
    id: "interior-apc-750ml",
    name: "Interior All-Purpose Cleaner 750ml",
    tagline: "Dash, vinyl, leather, plastics — one bottle.",
    price: 19,
    category: "interior",
    description:
      "Balanced interior cleaner that cuts through fingerprints, dust and food residue without leaving a slick or sticky residue.",
    features: [
      "Safe on leather, vinyl, and plastics",
      "Matte finish — no greasy shine",
      "Low-odour, water-based formula",
    ],
    image: `https://images.unsplash.com/photo-1583121274602-3e2820c69888${UNSPLASH_PARAMS}`,
    inStock: true,
  },
  {
    id: "ceramic-coating-starter-kit",
    name: "Ceramic Coating Starter Kit",
    tagline: "DIY 6-month protection — everything in the box.",
    price: 89,
    category: "wax-polish",
    description:
      "A complete entry-level ceramic coating kit with prep spray, coating bottle, applicator block, suede cloths and a finishing microfiber.",
    features: [
      "6 months of hydrophobic protection",
      "Covers up to 2 mid-size vehicles",
      "Step-by-step printed guide included",
    ],
    image: `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7${UNSPLASH_PARAMS}`,
    badge: "New",
    inStock: true,
  },
];
