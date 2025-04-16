"use client";

import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-16 bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-on-scroll">
          Ready to make a difference? Start here!
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-on-scroll">
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium h-12 px-8 text-base">
            Create an Account
          </Button>
          <Button
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white/10 h-12 px-8 text-base"
          >
            Schedule a Pickup
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
