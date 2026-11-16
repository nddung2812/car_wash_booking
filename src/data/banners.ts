export type Banner = {
  id: string;
  image: string;
  alt: string;
  href: string;
  priority?: boolean;
  /** Optional promo overlay text rendered on top of the slide. */
  eyebrow?: string;
  caption?: string;
};

export const banners: Banner[] = [
  // Seniors & pensioner offer — leads the slider while the promotion runs.
  // Wording mirrors booking-discount.ts; remove this slide if the offer is
  // ever switched off there. Photo: Unsplash free licence (photo-1601362840469).
  {
    id: "banner-seniors",
    image: "/banner-seniors.webp",
    alt: "Seniors and pensioners save $10 on any wash every Wednesday and Thursday",
    href: "/seniors-discount",
    priority: true,
    eyebrow: "Seniors & pensioner discount",
    caption: "Save $10 on any wash, every Wednesday & Thursday.",
  },
  {
    id: "banner-1",
    image: "/banner1.webp",
    alt: "Book a hand-finished Logan car wash today",
    href: "#booking",
    eyebrow: "Rainy day special",
    caption: "Book a mini detail on a rainy day, get a free exterior wash voucher.",
  },
  {
    id: "banner-2",
    image: "/banner2.webp",
    alt: "Browse Hyperdome Car Wash detailing packages",
    href: "#services",
    eyebrow: "Early bird offer",
    caption: "First online booking of the day gets $50 off your full detail.",
  },
  {
    id: "banner-3",
    image: "/banner3.webp",
    alt: "Visit Hyperdome Car Wash in Loganholme",
    href: "/locations/loganholme",
  },
];
