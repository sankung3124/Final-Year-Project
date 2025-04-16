"use client";

import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Truck, MapPin, BookOpen } from "lucide-react";

const Services = () => {
  const servicesRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const services = [
    {
      title: "Waste Pickup",
      description:
        "Schedule hassle-free waste collection at your convenience. Our reliable team ensures timely and efficient service.",
      icon: <Truck className="h-10 w-10 text-primary" />,
      delay: 0,
    },
    {
      title: "Recycling Centers",
      description:
        "Find nearby recycling drop-off points with our interactive map. Easily locate centers that accept your specific recyclables.",
      icon: <MapPin className="h-10 w-10 text-primary" />,
      delay: 200,
    },
    {
      title: "Education",
      description:
        "Learn how to reduce and recycle waste through our comprehensive resources, workshops, and community programs.",
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      delay: 400,
    },
  ];

  return (
    <section ref={servicesRef} className="py-16 px-4 bg-white" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive waste management solutions for a cleaner, greener
            Gambia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="animate-on-scroll"
              style={{
                transitionDelay: `${service.delay}ms`,
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                <CardHeader className="flex flex-col items-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl text-center">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="animate-on-scroll flex flex-col items-center">
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              1,250
            </h3>
            <p className="text-gray-600 text-center">Tons of Waste Recycled</p>
          </div>
          <div
            className="animate-on-scroll flex flex-col items-center"
            style={{ transitionDelay: "100ms" }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              5,000
            </h3>
            <p className="text-gray-600 text-center">Happy Customers</p>
          </div>
          <div
            className="animate-on-scroll flex flex-col items-center"
            style={{ transitionDelay: "200ms" }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              120
            </h3>
            <p className="text-gray-600 text-center">Communities Served</p>
          </div>
          <div
            className="animate-on-scroll flex flex-col items-center"
            style={{ transitionDelay: "300ms" }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              3,500
            </h3>
            <p className="text-gray-600 text-center">Trees Planted</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
