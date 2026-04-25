import BannerSlider from "@/components/BannerSlider";
import BookingForm from "@/components/BookingForm";
import CTABand from "@/components/CTABand";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LocationsSection from "@/components/LocationsSection";
import ReviewsSection from "@/components/ReviewsSection";
import { SectionIntro } from "@/components/SectionIntro";
import ServicesSection from "@/components/ServicesSection";
import { Marquee } from "@/components/visuals/Marquee";

const tickerItems = [
  "★ 4.9 Google rating",
  "Hand-finished detailing",
  "92% water reclaimed",
  "Eco-friendly chemistry",
  "Same-day bookings",
  "Members save 10%",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <BannerSlider />

      {/* Marquee */}
      <Marquee items={tickerItems} />

      {/* Services + add-ons */}
      <section id="services" className="py-20 lg:py-24">
        <div className="container mx-auto flex flex-col gap-20 px-4 sm:px-6 lg:px-8">
          <ServicesSection />
          <ExtraServicesSection />
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection />

      {/* Booking */}
      <section id="booking" className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionIntro
            kicker="04 — Book a wash"
            title="Pick a time that fits."
            description="Schedule online in under a minute. We'll be ready when you arrive."
            className="mb-10"
          />
          <BookingForm />
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews">
        <ReviewsSection />
      </section>

      {/* Big CTA band */}
      <CTABand />

      {/* Contact / locations */}
      <LocationsSection />
    </>
  );
}
