"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2 days ago",
    service: "Premium Wash",
    review: "Absolutely amazing service! My car looks brand new. The staff was professional and the facility was spotless. Will definitely be coming back!",
    verified: true
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 5,
    date: "1 week ago",
    service: "Full Service Detail",
    review: "Best car wash in town! They pay attention to every detail and the pricing is very reasonable. My BMW has never looked better.",
    verified: true
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 4,
    date: "2 weeks ago",
    service: "Express Wash",
    review: "Quick and efficient service. Perfect for when you need a fast clean. The online booking system made it super convenient.",
    verified: true
  },
  {
    id: 4,
    name: "David Thompson",
    rating: 5,
    date: "3 weeks ago",
    service: "Premium Wash",
    review: "Outstanding customer service and quality. They treated my truck with care and the results exceeded my expectations. Highly recommended!",
    verified: true
  },
  {
    id: 5,
    name: "Lisa Martinez",
    rating: 5,
    date: "1 month ago",
    service: "Deluxe Detail",
    review: "Professional team and excellent results. My car interior and exterior look fantastic. The eco-friendly products they use are a great bonus!",
    verified: true
  },
  {
    id: 6,
    name: "James Wilson",
    rating: 4,
    date: "1 month ago",
    service: "Basic Wash",
    review: "Great value for money. Clean facility, friendly staff, and my car came out sparkling clean. Will be back for sure!",
    verified: true
  }
];

const stats = [
  { label: "Happy Customers", value: "10,000+" },
  { label: "Average Rating", value: "4.9/5" },
  { label: "Years of Service", value: "15+" },
  { label: "Services Completed", value: "50,000+" }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. See what our satisfied customers have to say about our car wash services.
          </p>

          {/* Overall Rating */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-gray-600">
              Based on {reviews.length} reviews
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="h-full">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-60" />

                {/* Review Text */}
                <p className="text-gray-700 mb-4 line-clamp-4">
                  &quot;{review.review}&quot;
                </p>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={review.rating} />
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {review.name}
                        </p>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {review.service} • {review.date}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ready to experience our premium car wash service?
          </p>
          <a
            href="#booking"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Your Appointment
          </a>
        </div>
      </div>
    </section>
  );
}