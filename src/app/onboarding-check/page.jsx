"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function OnboardingCheck() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/signin");
        return;
      }

      try {
        const response = await axios.get("/api/auth/session?update=true");

        const serverSession = response.data.session;

        if (serverSession?.user?.role === "admin") {
          router.push("/admin/dashboard");
        } else if (serverSession?.user?.role === "driver") {
          router.push("/driver/dashboard");
        } else if (!serverSession?.user?.onboardingCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        console.log({session})
        if (session.session.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (session.session.user.role === "driver") {
          router.push("/driver/dashboard");
        } else if (!session.session.user.onboardingCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } finally {
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/80 to-primary">
      <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h1 className="text-xl font-semibold text-secondary">Redirecting...</h1>
        <p className="text-gray-600 mt-2">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  );
}
