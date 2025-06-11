"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext({});
export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  const loading = status === "loading";
  const isAuthenticated = !!session;
  const isAdmin = user?.role === "admin";

  const signInWithCredentials = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: result.error,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sign in successful!",
        description: "Welcome to EcoGambia.",
        variant: "primary",
      });

      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user?.role === "driver") {
        router.push("/driver/dashboard");
      } else if (!user?.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }

      return true;
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An error occurred during sign in.",
        variant: "destructive",
      });
      return false;
    }
  };
  const signInWithGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/onboarding-check" });
      return true;
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An error occurred during Google sign in.",
        variant: "destructive",
      });
      return false;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: data.message || "An error occurred during registration.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Registration successful!",
        description: "Please sign in with your new account.",
        variant: "primary",
      });

      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return false;
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Onboarding failed",
          description: data.message || "An error occurred during onboarding.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Onboarding completed!",
        description: "Your profile has been updated.",
        variant: "primary",
      });

      router.push("/dashboard");
      return true;
    } catch (error) {
      toast({
        title: "Onboarding failed",
        description: "An error occurred during onboarding.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  const contextValue = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    signInWithCredentials,
    signInWithGoogle,
    registerUser,
    completeOnboarding,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
