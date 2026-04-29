export interface Service {
  id: string;
  name: string;
  tagline: string;
  pricing: {
    sedan: number;
    wagon: number;
    suv: number; // This represents 4x4/SUV pricing
  };
  duration: string;
  description: string;
  image: string;
  videoUrl: string;
}

const UNSPLASH_PARAMS = "?w=1200&auto=format&fit=crop&q=80";

export const services: Service[] = [
  {
    id: "sparkles",
    name: "Sparkles Wash",
    tagline: "Hand wash, dry & shine — in and out fast.",
    pricing: { sedan: 40, wagon: 42, suv: 45 },
    duration: "30 min",
    description:
      "Hand wash and dry. Wheels detailed. Door frames wiped. External windows cleaned. Tyres shined.",
    // Unsplash search: "car hand wash sponge"
    image: `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/6tRqXG0OUqA",
  },
  {
    id: "super-sparkles",
    name: "Super Sparkles",
    tagline: "Wash plus full interior vacuum and deodorise.",
    pricing: { sedan: 60, wagon: 65, suv: 70 },
    duration: "45 min",
    description:
      "Sparkles Wash service plus full interior and boot vacuum. Windows cleaned inside and out. Cleaning of dash board and console. Vehicle deodorised.",
    // Unsplash search: "car interior vacuum"
    image: `https://images.unsplash.com/photo-1520340356584-f9917d1eea6f${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/Hhtg8EVIT-E",
  },
  {
    id: "mini-detail",
    name: "Mini Detail",
    tagline: "Wax, vinyl dressing, bug & tar removal.",
    pricing: { sedan: 70, wagon: 80, suv: 90 },
    duration: "90 min",
    description:
      "Super Sparkles service plus Bugs and road tar removed. Cup holders and compartments cleaned. Ash tray cleaned. All vinyl surfaces cleaned and dressed Bonus spray on wax.",
    // Unsplash search: "car polish microfiber close up"
    image: `https://images.unsplash.com/photo-1601362840469-51e4d8d58785${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/CqOf_5KPRLY",
  },
  {
    id: "interior-detail",
    name: "Interior Detail",
    tagline: "Seats, carpets, floor mats & boot shampooed.",
    pricing: { sedan: 250, wagon: 280, suv: 330 },
    duration: "2-3 hours",
    description:
      "Full interior vacuum. Seats, carpets, floor mats & boot shampooed Doors and door frames detailed. All vinyl surfaces cleaned and dressed.",
    // Unsplash search: "leather car seats interior"
    image: `https://images.unsplash.com/photo-1583121274602-3e2820c69888${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/qR_9u-rrN9c",
  },
  {
    id: "full-detail",
    name: "Full Detail",
    tagline: "Inside, outside, engine bay — the works.",
    pricing: { sedan: 350, wagon: 390, suv: 430 },
    duration: "4-5 hours",
    description:
      "Mini Detail service plus Engine-bay detailing service. Upholstery detailing service. Door frames and seals cleaned. Boot shampoo. Complete car clean inside and out. Hand polish.",
    // Unsplash search: "clean detailed car showroom"
    image: `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7${UNSPLASH_PARAMS}`,
    videoUrl: "https://www.youtube.com/embed/MbEWHzYdND0",
  },
];

export const vehicleTypes = ["Sedan", "Wagon", "SUV", "4x4"];

export interface ExtraService {
  id: string;
  name: string;
  pricing: {
    sedan: number;
    wagon: number;
    suv: number; // This represents 4x4/SUV pricing
  };
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
    id: "bug-tar-removal",
    name: "Bug and tar removal",
    pricing: { sedan: 5, wagon: 8, suv: 10 },
  },
  {
    id: "dog-hair-removal",
    name: "Dog hair removal from",
    pricing: { sedan: 10, wagon: 13, suv: 15 },
  },
  {
    id: "hand-polish",
    name: "Hand polish",
    pricing: { sedan: 50, wagon: 55, suv: 65 },
  },
  {
    id: "buffing",
    name: "Buffing from",
    pricing: { sedan: 120, wagon: 120, suv: 120 },
  },
  {
    id: "cut-polish",
    name: "Cut and Polish from",
    pricing: { sedan: 150, wagon: 150, suv: 150 },
  },
  {
    id: "paint-protection",
    name: "Paint Protection",
    pricing: { sedan: 150, wagon: 180, suv: 200 },
  },
  {
    id: "flash-dash",
    name: "Flash-Dash (Armour all)",
    pricing: { sedan: 7, wagon: 8, suv: 10 },
  },
  {
    id: "engine-bay",
    name: "Engine bay detailing",
    pricing: { sedan: 40, wagon: 45, suv: 50 },
  },
  {
    id: "leather-clean",
    name: "Leather clean & treatment",
    pricing: { sedan: 50, wagon: 60, suv: 70 },
  },
  {
    id: "slipstream-60",
    name: "Slipstream 60 days",
    pricing: { sedan: 15, wagon: 20, suv: 25 },
    description: "(60 days weather shield)",
  },
  {
    id: "slipstream-ultimate",
    name: "Slipstream Ultimate",
    pricing: { sedan: 70, wagon: 80, suv: 90 },
    description: "(1 year paint protection)",
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
  "4:30 PM",
];
