export interface Service {
  id: string;
  name: string;
  pricing: {
    sedan: number;
    wagon: number;
    suv: number; // This represents 4x4/SUV pricing
  };
  duration: string;
  description: string;
  videoUrl: string;
}

export const services: Service[] = [
  {
    id: "sparkles",
    name: "Sparkles Wash",
    pricing: { sedan: 40, wagon: 42, suv: 45 },
    duration: "30 min",
    description:
      "Hand wash and dry. Wheels detailed. Door frames wiped. External windows cleaned. Tyres shined.",
    videoUrl: "http://youtu.be/6tRqXG0OUqA",
  },
  {
    id: "super-sparkles",
    name: "Super Sparkles",
    pricing: { sedan: 60, wagon: 65, suv: 70 },
    duration: "45 min",
    description:
      "Sparkles Wash service plus full interior and boot vacuum. Windows cleaned inside and out. Cleaning of dash board and console. Vehicle deodorised.",
    videoUrl: "http://youtu.be/6tRqXG0OUqA",
  },
  {
    id: "mini-detail",
    name: "Mini Detail",
    pricing: { sedan: 70, wagon: 80, suv: 90 },
    duration: "90 min",
    description:
      "Super Sparkles service plus Bugs and road tar removed. Cup holders and compartments cleaned. Ash tray cleaned. All vinyl surfaces cleaned and dressed Bonus spray on wax.",
    videoUrl: "https://www.youtube.com/watch?v=Hhtg8EVIT-E",
  },
  {
    id: "interior-detail",
    name: "Interior Detail",
    pricing: { sedan: 250, wagon: 280, suv: 330 },
    duration: "2-3 hours",
    description:
      "Full interior vacuum. Seats, carpets, floor mats & boot shampooed Doors and door frames detailed. All vinyl surfaces cleaned and dressed.",
    videoUrl: "http://youtu.be/qR_9u-rrN9c",
  },
  {
    id: "full-detail",
    name: "Full Detail",
    pricing: { sedan: 350, wagon: 390, suv: 430 },
    duration: "4-5 hours",
    description:
      "Mini Detail service plus Engine-bay detailing service. Upholstery detailing service. Door frames and seals cleaned. Boot shampoo. Complete car clean inside and out. Hand polish.",
    videoUrl: "http://youtu.be/MbEWHzYdND0",
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
