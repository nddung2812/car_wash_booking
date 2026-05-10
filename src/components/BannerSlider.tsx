import BannerCarousel from "@/components/BannerCarousel";
import { banners } from "@/data/banners";

export default function BannerSlider() {
  return (
    <section className="relative">
      <h1 className="sr-only">
        Logan Car Wash — mobile detailing in Loganholme & Shailer Park
      </h1>
      <BannerCarousel banners={banners} />
    </section>
  );
}
