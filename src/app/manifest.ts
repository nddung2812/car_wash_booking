import type { MetadataRoute } from "next";
import { BUSINESS_NAME, BUSINESS_TAGLINE } from "@/lib/seo/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BUSINESS_NAME,
    short_name: "Hyperdome",
    description: `${BUSINESS_NAME} — ${BUSINESS_TAGLINE}.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F5F1",
    theme_color: "#F7F5F1",
    categories: ["business", "automotive", "lifestyle"],
    lang: "en-AU",
    icons: [
      {
        src: "/sparklesLogo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/sparklesLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/sparklesLogo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
