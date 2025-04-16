"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Simulate getting the user's current location
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentLocation = () => {
    setIsLoading(true);

    // Simulate getting location with timeout
    setTimeout(() => {
      setFromLocation("Current Location");
      setCurrentLocation("Banjul, Gambia");
      setIsLoading(false);
    }, 1500);

    // In a real app, you would use the Geolocation API:
    /*
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Here you would use a geocoding service to get the address
          // from the latitude/longitude coordinates
          setFromLocation('Current Location');
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
    */
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center hero-bg overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-primary/10 animate-pulse-slow"></div>
        <div className="absolute top-2/3 right-1/4 w-24 h-24 rounded-full bg-primary/20 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full bg-secondary/10 animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 py-32 pt-40 md:pt-32 relative z-10 text-center">
        <div
          className={cn(
            "transition-all duration-1000 transform",
            animationComplete
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          )}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Join the Movement for
            <br /> a Cleaner Gambia!
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            We help communities manage waste sustainably through easy
            scheduling, education, and recycling initiatives.
          </p>

          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative flex-1 flex rounded-md overflow-hidden shadow-md">
                <div className="w-24 h-12 bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">From</span>
                </div>
                <div className="flex-1 relative bg-white">
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    value={fromLocation || currentLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="h-12 border-0 shadow-none rounded-none pl-3 bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full text-primary"
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                  >
                    <MapPin
                      className={cn(
                        "h-5 w-5 transition-all",
                        isLoading && "animate-pulse"
                      )}
                    />
                  </Button>
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center w-12 h-12">
                <ArrowRight className="h-5 w-5 text-white animate-pulse" />
              </div>

              <div className="relative flex-1 flex rounded-md overflow-hidden shadow-md">
                <div className="w-24 h-12 bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">To</span>
                </div>
                <div className="flex-1 relative bg-white">
                  <Input
                    type="text"
                    placeholder="Destination"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="h-12 border-0 shadow-none rounded-none pl-3 bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full text-primary"
                  >
                    <Navigation className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="h-12 px-8 text-base">Schedule a Pickup</Button>
              <Button
                variant="outline"
                className="h-12 px-8 text-base bg-white/80 hover:bg-white text-secondary"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Wave shape divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          className="w-full h-auto"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
