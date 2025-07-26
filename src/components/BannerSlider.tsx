"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const banners = [
  {
    id: 1,
    image: "/banner1.webp",
  },
  {
    id: 2,
    image: "/banner2.jpg",
  },
  {
    id: 3,
    image: "/banner3.jpeg",
  }
];

export default function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isAutoPlaying) {
      const timer = setInterval(() => {
        handleSlideChange((currentSlide + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlaying, currentSlide]);

  const handleSlideChange = (newSlide: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide(newSlide);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    handleSlideChange(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newSlide = (currentSlide - 1 + banners.length) % banners.length;
    handleSlideChange(newSlide);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    const newSlide = (currentSlide + 1) % banners.length;
    handleSlideChange(newSlide);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-xl">
      {/* Background Images with Transitions */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={banner.image}
            alt={`Banner ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* CTA Content with Animation */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div
          className={`text-center space-y-6 transform transition-all duration-500 ease-in-out ${
            isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-8"
              asChild
            >
              <a href="#booking">Book Now</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold px-8 bg-transparent backdrop-blur-sm"
              asChild
            >
              <a href="#services">Learn More</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation arrows with better visibility */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 shadow-xl bg-black/20 backdrop-blur-sm border border-white/20 transform hover:scale-110 transition-all duration-200 z-20"
        onClick={goToPrevious}
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 shadow-xl bg-black/20 backdrop-blur-sm border border-white/20 transform hover:scale-110 transition-all duration-200 z-20"
        onClick={goToNext}
        disabled={isTransitioning}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Enhanced dots indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-lg transform hover:scale-125 ${
              index === currentSlide
                ? "bg-white shadow-white/50"
                : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-20">
        {currentSlide + 1} / {banners.length}
      </div>
    </div>
  );
}