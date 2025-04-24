"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";
import { signupSchema } from "@/lib/schema/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Mail, Lock, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  const watchPassword = form.watch("password");
  useState(() => {
    if (watchPassword) {
      const hasMinLength = watchPassword.length >= 8;
      const hasLowerCase = /[a-z]/.test(watchPassword);
      const hasUpperCase = /[A-Z]/.test(watchPassword);
      const hasNumber = /[0-9]/.test(watchPassword);
      const hasSpecialChar = /[^a-zA-Z0-9]/.test(watchPassword);

      let score = 0;
      if (hasMinLength) score += 1;
      if (hasLowerCase) score += 1;
      if (hasUpperCase) score += 1;
      if (hasNumber) score += 1;
      if (hasSpecialChar) score += 1;

      setPasswordStrength({
        score,
        hasMinLength,
        hasLowerCase,
        hasUpperCase,
        hasNumber,
        hasSpecialChar,
      });
    }
  }, [watchPassword]);

  const nextStep = () => {
    const { firstName, lastName, email } = form.getValues();

    const firstStepValid = form.trigger(["firstName", "lastName", "email"]);

    if (firstStepValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    if (step === 1) {
      nextStep();
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/signup", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Your account has been created. You can now log in.",
          variant: "success",
        });

        router.push("/signin");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error.response?.data?.message ||
          "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/onboarding-check" });
    } catch (error) {
      toast({
        title: "Google sign-in failed",
        description: "An error occurred during Google sign in.",
        variant: "destructive",
      });
    }
  };

  const renderPasswordStrengthBar = () => {
    const getColor = () => {
      if (passwordStrength.score === 0) return "bg-gray-200";
      if (passwordStrength.score < 2) return "bg-red-500";
      if (passwordStrength.score < 4) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className="mt-1">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div
            className={
              passwordStrength.hasMinLength
                ? "text-green-600 font-medium flex items-center"
                : "text-gray-500 flex items-center"
            }
          >
            {passwordStrength.hasMinLength && (
              <Check className="h-3 w-3 mr-1" />
            )}
            8+ Characters
          </div>
          <div
            className={
              passwordStrength.hasUpperCase
                ? "text-green-600 font-medium flex items-center"
                : "text-gray-500 flex items-center"
            }
          >
            {passwordStrength.hasUpperCase && (
              <Check className="h-3 w-3 mr-1" />
            )}
            Uppercase
          </div>
          <div
            className={
              passwordStrength.hasLowerCase
                ? "text-green-600 font-medium flex items-center"
                : "text-gray-500 flex items-center"
            }
          >
            {passwordStrength.hasLowerCase && (
              <Check className="h-3 w-3 mr-1" />
            )}
            Lowercase
          </div>
          <div
            className={
              passwordStrength.hasNumber
                ? "text-green-600 font-medium flex items-center"
                : "text-gray-500 flex items-center"
            }
          >
            {passwordStrength.hasNumber && <Check className="h-3 w-3 mr-1" />}
            Number
          </div>
          <div
            className={
              passwordStrength.hasSpecialChar
                ? "text-green-600 font-medium flex items-center"
                : "text-gray-500 flex items-center"
            }
          >
            {passwordStrength.hasSpecialChar && (
              <Check className="h-3 w-3 mr-1" />
            )}
            Special Character
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="flex-1">
          <div
            className={`h-1 ${
              step >= 1 ? "bg-primary" : "bg-gray-200"
            } rounded-l-full`}
          ></div>
          <p
            className={`text-xs mt-1 ${
              step >= 1 ? "text-primary font-medium" : "text-gray-500"
            }`}
          >
            Personal Info
          </p>
        </div>
        <div className="flex-1">
          <div
            className={`h-1 ${
              step >= 2 ? "bg-primary" : "bg-gray-200"
            } rounded-r-full`}
          ></div>
          <p
            className={`text-xs mt-1 text-right ${
              step >= 2 ? "text-primary font-medium" : "text-gray-500"
            }`}
          >
            Security
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            placeholder="John"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {renderPasswordStrengthBar()}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:text-primary/80"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:text-primary/80"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}

          <div
            className={step === 1 ? "flex justify-end" : "flex justify-between"}
          >
            {step === 2 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            <Button
              type={step === 1 ? "button" : "submit"}
              onClick={step === 1 ? nextStep : undefined}
              className={step === 1 ? "w-full" : "w-2/3 ml-auto"}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {step === 1 ? "Next" : "Creating Account..."}
                </div>
              ) : step === 1 ? (
                "Next"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <Button type="button" variant="outline" className="w-full">
            <svg
              className="h-5 w-5 mr-2"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13.397 20.997v-8.196h2.765l0.411-3.209h-3.176v-2.050c0-0.929 0.258-1.563 1.587-1.563h1.684v-2.873c-0.321-0.043-1.401-0.135-2.670-0.135-2.639 0-4.446 1.611-4.446 4.572v2.050h-2.991v3.209h2.991v8.196h4.845z"></path>
            </svg>
            Facebook
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
