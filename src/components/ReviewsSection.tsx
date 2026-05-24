"use client";

import Link from "next/link";
import { Star, Quote } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";
import { SOCIAL_LINKS } from "@/lib/seo/business";

const SERVICE_LABEL = "Used one of our services";

const reviews = [
  {
    id: 1,
    name: "Hayley",
    rating: 5,
    review:
      "Booked the in & out clean for my Mazda after a weekend camping trip — there was red dirt absolutely everywhere, kids had spilled juice in the back seat, the works. Didn't think they'd get the stains out but honestly it came back looking better than when I bought it. The guy who handed me the keys even pointed out a chip on the bonnet I'd never noticed. Will be back.",
  },
  {
    id: 2,
    name: "Daniel",
    rating: 5,
    review:
      "Quick stop on the way home from work. In and out in about 40 mins, paid on the app the night before. No fuss. Car was clean. That's all I wanted.",
  },
  {
    id: 3,
    name: "Priya",
    rating: 4,
    review:
      "Really nice job overall. Found a tiny smudge on the inside of the windscreen when I got home but everything else was spot on, especially the wheels — they actually scrub them, not just spray and pray like the place I used to go to in Springwood. Booking online was easy too, took maybe 2 minutes.",
  },
  {
    id: 4,
    name: "Tom",
    rating: 5,
    review:
      "Took the ute in after a job site week and it was rough. Mud caked under the tray, dog hair through the cab. They didn't blink. Three hours later it smelled like a new car. Mate who recommended them wasn't lying.",
  },
  {
    id: 5,
    name: "Jess",
    rating: 5,
    review:
      "Genuinely the best detail I've had locally. I'm pretty fussy about my car (got a 2019 Outlander, paid extra for the leather) and these guys actually treat the seats properly instead of just wiping them with whatever. Asked questions, didn't try to upsell me on stuff I didn't need. Polite, on time, fair price.",
  },
  {
    id: 6,
    name: "Marcus",
    rating: 4,
    review:
      "Solid wash. Bit of a wait on a Saturday morning but that's my own fault for not booking ahead. Would recommend.",
  },
  {
    id: 7,
    name: "Rebecca",
    rating: 5,
    review:
      "Brought my Kluger in last week — three kids, two dogs, you can imagine. Goldfish under the third row, a sticker stuck to the carpet that's been there since Christmas. They got everything. Even sorted out a coffee stain on the headliner I'd given up on. The receipt came through to my email before I'd even left the carpark. Already booked the partner's car in for next weekend.",
  },
  {
    id: 8,
    name: "Liam",
    rating: 5,
    review:
      "First time using them, won't be the last. Friendly without being over the top, no pressure to add stuff. Car looks great.",
  },
  {
    id: 9,
    name: "Anh",
    rating: 5,
    review:
      "I work nights so I needed an early slot — they had a 7am Tuesday open which was perfect. Dropped the keys, walked to the cafe across the road, came back to a car I barely recognised. The dash shine isn't that greasy plastic look either, looks natural. Small thing but it matters.",
  },
];

const stats = [
  { label: "Washes / year", value: "12k+" },
  { label: "Avg rating", value: "4.9 / 5" },
  { label: "Years serving", value: "15+" },
  { label: "Locations", value: "2" },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          style={{ width: size, height: size }}
          className={
            star <= rating
              ? "fill-yellow text-yellow"
              : "fill-transparent text-line-2"
          }
        />
      ))}
    </span>
  );
}

export default function ReviewsSection() {
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="bg-secondary/40 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="03 — Customers"
          title="They came for the wash. They stayed for the finish."
        />
        <div className="mt-5 inline-flex items-center gap-3">
          <StarRating rating={Math.round(averageRating)} size={16} />
          <span className="font-serif text-2xl text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            · {reviews.length} reviews
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-line bg-card-gradient p-5 shadow-soft"
            >
              <span className="font-serif text-[40px] leading-none text-foreground">
                {stat.value}
              </span>
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="lift flex h-full flex-col gap-4 rounded-[20px] border border-line bg-card-gradient p-6 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <Quote className="size-7 text-primary/70" />
                <StarRating rating={review.rating} />
              </div>
              <p className="text-[16px] leading-relaxed text-foreground">
                &ldquo;{review.review}&rdquo;
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-line pt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-brand-soft font-mono text-[11px] uppercase tracking-wider text-primary">
                      {review.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[14px] font-medium text-foreground">
                      {review.name}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {SERVICE_LABEL}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] text-muted-foreground">
            Customer testimonials. Read verified reviews on{" "}
            <a
              href={SOCIAL_LINKS.google}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Google
            </a>
            .
          </p>
          <Button asChild size="lg">
            <Link href="/book-car-wash-online">Book your wash</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
