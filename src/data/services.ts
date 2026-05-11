export interface Service {
  id: string;
  name: string;
  subtitle?: string;
  bullets: string[];
  pricing: {
    sedan: number;
    wagon: number;
    suv: number; // 4x4/SUV
  };
  bestValue?: boolean;
  savings?: number;
  promo?: {
    line1: string;
    line2: string;
    ariaLabel?: string;
  };
  duration: string;
  tagline: string;
  description: string;
  image: string;
  videoUrl: string;
}

const UNSPLASH_PARAMS = "?w=1200&auto=format&fit=crop&q=80";

export const services: Service[] = [
  {
    id: "sparkles",
    name: "Exterior Wash",
    bullets: [
      "Hand Wash & Chamois Dry",
      "Tyre Shine, Wheel Clean",
      "Windows Clean (Outside)",
    ],
    pricing: { sedan: 40, wagon: 45, suv: 50 },
    duration: "30 min",
    tagline: "Hand wash, chamois dry and tyre shine.",
    description:
      "Hand wash and chamois dry. Tyre shine and wheel clean. Outside windows cleaned.",
    image: `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/6tRqXG0OUqA",
  },
  {
    id: "super-sparkles",
    name: "Mini-Detail",
    bullets: [
      "Wash & vacuum",
      "Tyre shine & window clean (in & out)",
      "Dashboard, console & interior wiped",
      "Door well wiped",
      "Add-on Seat Wipe $25",
    ],
    pricing: { sedan: 70, wagon: 80, suv: 90 },
    duration: "45 min",
    tagline: "Wash, vacuum and interior wipe-down.",
    description:
      "Wash and vacuum. Tyre shine and windows cleaned inside and out. Dashboard, console and interior wiped. Door wells wiped.",
    image: `https://images.unsplash.com/photo-1520340356584-f9917d1eea6f${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/Hhtg8EVIT-E",
  },
  {
    id: "mini-detail",
    name: "Detail & Hand Polish",
    bullets: [
      "Mini-Detail +",
      "In & Out Service +",
      "Hand Polishing",
      "Clay Bar + Nano Spray",
      "Add-on Seat Wipe $25",
    ],
    pricing: { sedan: 95, wagon: 110, suv: 120 },
    bestValue: true,
    savings: 20,
    duration: "90 min",
    tagline: "Mini-Detail plus hand polish and clay bar — our best value.",
    description:
      "Mini-Detail plus full in and out service. Hand polishing, clay bar and nano spray finish.",
    image: `https://images.unsplash.com/photo-1601362840469-51e4d8d58785${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/CqOf_5KPRLY",
  },
  {
    id: "interior-detail",
    name: "Interior Detail",
    subtitle: "Only inside",
    bullets: [
      "Full Interior Vacuum & Shampoo (Seat, Carpet, Boot, Mats)",
      "All Compartments Detailed",
      "Leather Seats Clean & Conditioned",
      "All Interior Detailed & Shined",
    ],
    pricing: { sedan: 250, wagon: 280, suv: 330 },
    duration: "2-3 hours",
    tagline: "Full interior shampoo, leather and detail.",
    description:
      "Full interior vacuum and shampoo of seats, carpets, boot and mats. All compartments detailed. Leather seats cleaned and conditioned. Interior detailed and shined.",
    image: `https://images.unsplash.com/photo-1583121274602-3e2820c69888${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/qR_9u-rrN9c",
  },
  {
    id: "full-detail",
    name: "Full Detail",
    subtitle: "Pre-sale",
    bullets: [
      "Interior Detailing +",
      "Exterior Wash +",
      "Bugs & Tar Removed",
      "Hand Polishing",
      "Engine Bay Detailing (upon request, no liability)",
    ],
    pricing: { sedan: 320, wagon: 350, suv: 390 },
    promo: {
      line1: "First 2 bookings",
      line2: "Get $80 off",
      ariaLabel: "First 2 bookings get $80 off",
    },
    duration: "4-5 hours",
    tagline: "Inside, outside, bugs, hand polish and engine bay.",
    description:
      "Interior detailing plus exterior wash. Bugs and tar removed. Hand polishing. Engine bay detailing on request.",
    image: `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/MbEWHzYdND0",
  },
];

export const vehicleTypes = ["Sedan", "Wagon", "SUV", "4x4"];

export type PriceNote = "flat" | "from" | "quote" | "tiered";

export interface ExtraService {
  id: string;
  name: string;
  pricing: {
    sedan: number;
    wagon: number;
    suv: number; // 4x4/SUV
  };
  priceNote?: PriceNote;
  description?: string;
}

export function getExtraPrice(extra: ExtraService, vehicleType: string | undefined) {
  const v = (vehicleType ?? "").toLowerCase();
  if (v.includes("suv") || v.includes("4x4")) return extra.pricing.suv;
  if (v.includes("wagon")) return extra.pricing.wagon;
  return extra.pricing.sedan;
}

export const extraServices: ExtraService[] = [
  {
    id: "aircon-antibacterial",
    name: "Air-Con. Anti-Bacterial Treatment",
    pricing: { sedan: 50, wagon: 50, suv: 50 },
    priceNote: "flat",
  },
  {
    id: "machine-polishing",
    name: "Machine Polishing",
    pricing: { sedan: 55, wagon: 55, suv: 55 },
    priceNote: "from",
  },
  {
    id: "cut-polish",
    name: "Cut & Polish",
    pricing: { sedan: 0, wagon: 0, suv: 0 },
    priceNote: "quote",
  },
  {
    id: "seat-wipes",
    name: "Seat Wipes",
    pricing: { sedan: 25, wagon: 25, suv: 25 },
    priceNote: "flat",
  },
  {
    id: "armourall",
    name: "Armourall",
    pricing: { sedan: 25, wagon: 25, suv: 25 },
    priceNote: "from",
  },
  {
    id: "clay-bar-nano",
    name: "Clay Bar & Nano Spray Service",
    pricing: { sedan: 35, wagon: 35, suv: 35 },
    priceNote: "from",
  },
  {
    id: "baby-seat-clean",
    name: "Baby Seat & Pram Clean & Sanitised",
    pricing: { sedan: 55, wagon: 55, suv: 55 },
    priceNote: "from",
  },
  {
    id: "bugs-removed",
    name: "Bugs Removed",
    pricing: { sedan: 15, wagon: 15, suv: 15 },
    priceNote: "from",
  },
  {
    id: "dog-hair-removal",
    name: "Dog Hair Removal",
    pricing: { sedan: 25, wagon: 25, suv: 25 },
    priceNote: "from",
  },
  {
    id: "shampoo-seat-carpet",
    name: "Shampoo (1 seat OR 1 carpet)",
    pricing: { sedan: 30, wagon: 30, suv: 30 },
    priceNote: "flat",
  },
  {
    id: "engine-bay-clean",
    name: "Engine Bay Clean",
    description: "no liability",
    pricing: { sedan: 40, wagon: 45, suv: 50 },
    priceNote: "tiered",
  },
  {
    id: "headlights-restoration",
    name: "Headlights Restoration",
    pricing: { sedan: 80, wagon: 80, suv: 80 },
    priceNote: "flat",
  },
  {
    id: "leather-clean-condition",
    name: "Leather Clean & Condition",
    pricing: { sedan: 80, wagon: 90, suv: 100 },
    priceNote: "tiered",
  },
  {
    id: "ceramic-paint-protection",
    name: "Ceramic Paint Protection",
    pricing: { sedan: 599, wagon: 599, suv: 599 },
    priceNote: "from",
  },
];

export const timeSlots = [
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];
