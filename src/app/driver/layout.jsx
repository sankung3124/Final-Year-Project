// src/app/driver/layout.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Calendar,
  MapPin,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function DriverLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.user.role !== "driver") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/driver/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Assigned Pickups",
      href: "/driver/pickups",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      name: "Schedule",
      href: "/driver/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Route Map",
      href: "/driver/map",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      name: "History",
      href: "/driver/history",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/driver/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-white shadow-md transition-all duration-300 ease-in-out z-20 hidden md:flex md:flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col flex-1 p-4">
          <div
            className={cn(
              "flex items-center justify-between mb-8",
              !isSidebarOpen && "justify-center"
            )}
          >
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              {isSidebarOpen && (
                <span className="ml-2 text-xl font-semibold text-secondary">
                  EcoGambia Driver
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-1 flex-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-600 hover:bg-primary/10 hover:text-primary rounded-md transition-colors",
                  isSidebarOpen ? "justify-start" : "justify-center"
                )}
              >
                {link.icon}
                {isSidebarOpen && <span className="ml-3">{link.name}</span>}
              </Link>
            ))}
          </div>

          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center mt-auto px-4 py-3 text-gray-600 hover:bg-primary/10 hover:text-primary rounded-md transition-colors",
              isSidebarOpen ? "justify-start" : "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Sign Out</span>}
          </button>

          {isSidebarOpen && (
            <div className="mt-4 px-4 py-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {session?.user?.firstName?.charAt(0) || "D"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={toggleMobileSidebar}
            ></div>
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-md z-40 flex flex-col p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-semibold text-secondary">
                    EcoGambia Driver
                  </span>
                </div>
                <button
                  onClick={toggleMobileSidebar}
                  className="text-gray-500 hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1 flex-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center px-4 py-3 text-gray-600 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    {link.icon}
                    <span className="ml-3">{link.name}</span>
                  </Link>
                ))}
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center mt-auto px-4 py-3 text-gray-600 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sign Out</span>
              </button>

              <div className="mt-4 px-4 py-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {session?.user?.firstName?.charAt(0) || "D"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out ml-0 md:ml-20",
          isSidebarOpen && "md:ml-64"
        )}
      >
        <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
