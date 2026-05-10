export type Banner = {
  id: string;
  image: string;
  alt: string;
  href: string;
  priority?: boolean;
};

export const banners: Banner[] = [
  {
    id: "banner-1",
    image: "/banner1.webp",
    alt: "Book a hand-finished Logan car wash today",
    href: "#booking",
    priority: true,
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
