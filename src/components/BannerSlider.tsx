import BannerCarousel from "@/components/BannerCarousel";
import { banners } from "@/data/banners";

export default function BannerSlider() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 pt-10 pb-6 sm:px-6 lg:px-8 lg:pt-14 lg:pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Logan QLD · Shailer Park · Loganholme
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Hand-finished car wash in Logan QLD
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Professional hand wash and detailing at two Hyperdome Shopping Centre
          bays — Shailer Park and Loganholme. Same-day online bookings, open
          seven days.
        </p>
      </div>
      <BannerCarousel banners={banners} />
    </section>
  );
}
