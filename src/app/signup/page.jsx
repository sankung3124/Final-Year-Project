"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appearAnimation, setAppearAnimation] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setAppearAnimation(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (formData.password) {
      const hasMinLength = formData.password.length >= 8;
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);

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
    } else {
      setPasswordStrength({
        score: 0,
        hasMinLength: false,
        hasLowerCase: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError("Please enter a password");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Please create a stronger password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      nextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      router.push("/signin");
      setLoading(false);
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/80 to-primary">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-white hover:text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform",
            appearAnimation
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          )}
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-secondary">
                Create an Account
              </h1>
              <p className="text-gray-600 mt-2">
                Join EcoGambia and make a difference
              </p>
            </div>

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

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700 block"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="John"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700 block"
                      >
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="john.doe@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Create a password"
                        className="pl-10"
                        value={formData.password}
                        onChange={handleChange}
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
                    {renderPasswordStrengthBar()}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToTerms" className="text-gray-700">
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
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div
                className={
                  step === 1 ? "flex justify-end" : "flex justify-between"
                }
              >
                {step === 2 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
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

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.203-2.701-6.735-2.701-5.561 0-10.063 4.502-10.063 10.063s4.502 10.063 10.063 10.063c8.333 0 10.063-7.835 10.063-13.032 0-0.843-0.076-1.646-0.228-2.417h-9.836z"></path>
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.397 20.997v-8.196h2.765l0.411-3.209h-3.176v-2.050c0-0.929 0.258-1.563 1.587-1.563h1.684v-2.873c-0.321-0.043-1.401-0.135-2.670-0.135-2.639 0-4.446 1.611-4.446 4.572v2.050h-2.991v3.209h2.991v8.196h4.845z"></path>
                  </svg>
                </button>
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
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#FFFFFF"
            fillOpacity="0.3"
            d="M0,64L48,80C96,96,192,128,288,149.3C384,171,480,181,576,165.3C672,149,768,107,864,90.7C960,75,1056,85,1152,90.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
