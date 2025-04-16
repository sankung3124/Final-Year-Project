"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-primary mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <span className="text-xl font-bold">EcoGambia</span>
            </div>
            <p className="text-white/70 mb-4">
              Committed to creating a cleaner, more sustainable future for
              Gambia through innovative waste management solutions.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white/70 hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-white/70 hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="#"
                className="text-white/70 hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="#"
                className="text-white/70 hover:text-primary transition-colors"
              >
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Schedule Pickup", href: "/schedule" },
                { name: "Recycling Centers", href: "/centers" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {[
                { name: "Blog", href: "/blog" },
                { name: "Educational Resources", href: "/resources" },
                { name: "FAQ", href: "/faq" },
                { name: "Community Programs", href: "/programs" },
                { name: "Partners", href: "/partners" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="text-primary mr-3 h-5 w-5 mt-0.5" />
                <span className="text-white/70">
                  123 Eco Street, Banjul, Gambia
                </span>
              </div>
              <div className="flex items-start">
                <Phone className="text-primary mr-3 h-5 w-5 mt-0.5" />
                <span className="text-white/70">+220 123 4567</span>
              </div>
              <div className="flex items-start">
                <Mail className="text-primary mr-3 h-5 w-5 mt-0.5" />
                <span className="text-white/70">info@ecogambia.com</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Payment Methods</h4>
              <div className="flex space-x-3">
                <div className="w-10 h-6 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">VISA</span>
                </div>
                <div className="w-10 h-6 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">MC</span>
                </div>
                <div className="w-10 h-6 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 mt-4">
          <div className="text-center text-white/50 text-sm">
            <p>
              &copy; {new Date().getFullYear()} EcoGambia. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center space-x-4">
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
