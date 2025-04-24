"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function OnboardingCheck() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.user.role === "admin") {
      router.push("/admin/dashboard");
    } else if (!session.user.onboardingCompleted) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
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
