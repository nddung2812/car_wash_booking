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
  {
    id: "banner-1",
    image: "/banner1.webp",
    alt: "Book a hand-finished Logan car wash today",
    href: "#booking",
    priority: true,
    eyebrow: "Rainy day special",
    caption: "Book a mini detail on a rainy day, get a free exterior wash voucher.",
  },
  {
    id: "banner-2",
    image: "/banner2.webp",
    alt: "Browse Hyperdome Car Wash detailing packages",
    href: "#services",
  },
  {
    id: "banner-3",
    image: "/banner3.webp",
    alt: "Visit Hyperdome Car Wash in Loganholme",
    href: "/locations/loganholme",
  },
];
