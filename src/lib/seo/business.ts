export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://logancarwash.com.au";

export const BUSINESS_NAME = "Hyperdome Car Wash";
export const BUSINESS_LEGAL_NAME = "Hyperdome Car Wash";
export const BUSINESS_ABN = "50 162 253 072";
export const BUSINESS_TAGLINE = "Professional car wash in Logan QLD";
export const BUSINESS_DESCRIPTION =
  "Hyperdome Car Wash is a professional hand-finished car wash and detailing service with two locations inside Hyperdome Shopping Centre, Logan QLD. Same-day bookings, eco-grade chemistry and ceramic-grade finishing for sedans, wagons and 4×4s.";

export const BUSINESS_PHONE = "+61738060358";
export const BUSINESS_PHONE_DISPLAY = "(07) 3806 0358";
export const BUSINESS_PRICE_RANGE = "$$";

export const SOCIAL_LINKS = {
  google: "https://www.google.com/maps?cid=4738094889088025437",
  facebook: "https://www.facebook.com/hyperdomecarwash",
  instagram: "https://www.instagram.com/hyperdomecarwash",
} as const;

export const AREA_SERVED = [
  "Logan City",
  "Shailer Park",
  "Loganholme",
  "Beenleigh",
  "Springwood",
  "Daisy Hill",
  "Rochedale South",
  "Cornubia",
  "Tanah Merah",
  "Underwood",
] as const;

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface OpeningHour {
  day: DayOfWeek;
  opens: string;
  closes: string;
}

export const OPENING_HOURS: OpeningHour[] = [
  { day: "Monday", opens: "08:30", closes: "16:00" },
  { day: "Tuesday", opens: "09:00", closes: "16:00" },
  { day: "Wednesday", opens: "08:30", closes: "16:00" },
  { day: "Thursday", opens: "08:30", closes: "16:00" },
  { day: "Friday", opens: "08:30", closes: "16:00" },
  { day: "Saturday", opens: "08:30", closes: "16:00" },
  { day: "Sunday", opens: "09:00", closes: "16:00" },
];

export interface Location {
  slug: "shailer-park" | "loganholme";
  name: string;
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  phone: string;
  phoneDisplay: string;
  phoneTel: string;
  geo: { latitude: number; longitude: number };
  mapUrl: string;
  mapEmbedUrl: string;
  directionsUrl: string;
}

export const LOCATIONS: Location[] = [
  {
    slug: "shailer-park",
    name: "Hyperdome Car Wash — Shailer Park",
    streetAddress: "Hyperdome Shopping Centre, Carpark Basement, Mandew St",
    addressLocality: "Shailer Park",
    postalCode: "4128",
    phone: "+61738011988",
    phoneDisplay: "(07) 3801 1988",
    phoneTel: "tel:+61738011988",
    geo: { latitude: -27.6592, longitude: 153.17 },
    mapUrl:
      "https://www.google.com/maps/place/Hyperdome+Shopping+Centre/@-27.6592,153.17,17z",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.887531633727!2d153.16938207546565!3d-27.658951176210298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91423b28b00705%3A0x41c1806fafd6115d!2sHyperdome%20Shopping%20Centre!5e0!3m2!1sen!2sau!4v1753526071902!5m2!1sen!2sau",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Hyperdome+Shopping+Centre+Mandew+St+Shailer+Park+QLD+4128",
  },
  {
    slug: "loganholme",
    name: "Hyperdome Car Wash — Loganholme",
    streetAddress: "Hyperdome Shopping Centre, Carpark Basement, 2 Leda Dr",
    addressLocality: "Loganholme",
    postalCode: "4129",
    phone: "+61738060358",
    phoneDisplay: "(07) 3806 0358",
    phoneTel: "tel:+61738060358",
    geo: { latitude: -27.6585, longitude: 153.1707 },
    mapUrl:
      "https://www.google.com/maps/place/Hyperdome+Shopping+Centre/@-27.6585,153.1707,17z",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.879682247107!2d153.16508939678954!3d-27.659194000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91422509b7a6d5%3A0xd2f71d6a8d1f45b9!2sSparkles%20Car%20Wash!5e0!3m2!1sen!2sau!4v1777377424655!5m2!1sen!2sau",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Hyperdome+Shopping+Centre+2+Leda+Dr+Loganholme+QLD+4129",
  },
];

export const LOCATION_BY_SLUG: Record<Location["slug"], Location> =
  Object.fromEntries(LOCATIONS.map((l) => [l.slug, l])) as Record<
    Location["slug"],
    Location
  >;

export const PRIMARY_LOCATION = LOCATION_BY_SLUG["loganholme"];
