"use client";

import { Star, Quote } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionIntro } from "@/components/SectionIntro";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2 days ago",
    service: "Premium Wash",
    review:
      "Absolutely amazing service! My car looks brand new. The staff was professional and the facility was spotless. Will definitely be coming back!",
    verified: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 5,
    date: "1 week ago",
    service: "Full Service Detail",
    review:
      "Best car wash in town. They pay attention to every detail and the pricing is reasonable. My BMW has never looked better.",
    verified: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 4,
    date: "2 weeks ago",
    service: "Express Wash",
    review:
      "Quick and efficient service. Perfect for when you need a fast clean. The online booking made it super convenient.",
    verified: true,
  },
  {
    id: 4,
    name: "David Thompson",
    rating: 5,
    date: "3 weeks ago",
    service: "Premium Wash",
    review:
      "Outstanding customer service and quality. They treated my truck with care and the results exceeded my expectations.",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Martinez",
    rating: 5,
    date: "1 month ago",
    service: "Deluxe Detail",
    review:
      "Professional team and excellent results. My car interior and exterior look fantastic. The eco-friendly products are a great bonus.",
    verified: true,
  },
  {
    id: 6,
    name: "James Wilson",
    rating: 4,
    date: "1 month ago",
    service: "Basic Wash",
    review:
      "Great value for money. Clean facility, friendly staff, and my car came out sparkling clean. Will be back for sure.",
    verified: true,
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
              <p className="font-serif text-[20px] italic leading-snug text-foreground">
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
                      {review.service} · {review.date}
                    </span>
                  </div>
                </div>
                {review.verified && <Badge variant="secondary">Verified</Badge>}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] text-muted-foreground">
            Ready for the kind of clean that gets compliments?
          </p>
          <Button asChild size="lg">
            <a href="#booking">Book your wash</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
