"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Homeowner",
    avatar: "/images/avatar-1.jpg",
    content:
      "EcoGambia has transformed how our neighborhood handles waste. Their scheduled pickups are always on time, and the recycling education they provided helped us reduce our landfill waste by 60%!",
    rating: 5,
  },
  {
    id: 2,
    name: "Mohammed Ceesay",
    role: "Business Owner",
    avatar: "/images/avatar-2.jpg",
    content:
      "As a restaurant owner, proper waste management is crucial. EcoGambia provided custom solutions that saved us money while helping us become more environmentally responsible. Their team is professional and reliable.",
    rating: 5,
  },
  {
    id: 3,
    name: "Fatou Touray",
    role: "Community Leader",
    avatar: "/images/avatar-3.jpg",
    content:
      "Our community partnership with EcoGambia has led to cleaner streets and created environmental awareness among our youth. Their educational programs are engaging and impactful.",
    rating: 4,
  },
  {
    id: 4,
    name: "David Williams",
    role: "School Administrator",
    avatar: "/images/avatar-4.jpg",
    content:
      "EcoGambia's school recycling program has been a huge success. Students are excited about environmental conservation, and we've reduced our waste disposal costs significantly.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  const nextTestimonial = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnimating]);

  const handleDotClick = (index) => {
    if (isAnimating || index === activeIndex) return;

    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from the people and communities we've helped across Gambia
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-0 -left-4 md:-left-8 text-primary/20 z-0">
            <Quote size={80} strokeWidth={1} />
          </div>

          <div className="relative z-10 bg-white rounded-xl shadow-lg p-6 md:p-10 overflow-hidden">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "transition-all duration-500 w-full",
                  isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                  {[...Array(5 - testimonials[activeIndex].rating)].map(
                    (_, i) => (
                      <Star key={i} className="w-5 h-5 text-gray-300" />
                    )
                  )}
                </div>

                <p className="text-lg md:text-xl text-gray-700 mb-8 text-center">
                  "{testimonials[activeIndex].content}"
                </p>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-3">
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                      {testimonials[activeIndex].name.charAt(0)}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-secondary">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-gray-500">
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 items-center">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors mr-2"
              disabled={isAnimating}
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex space-x-2 mx-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    index === activeIndex
                      ? "bg-primary"
                      : "bg-gray-300 hover:bg-primary/50"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors ml-2"
              disabled={isAnimating}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
