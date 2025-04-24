import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign In - EcoGambia",
  description: "Sign in to your EcoGambia account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary/80 to-secondary relative">
      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#18A65C"
            fillOpacity="0.3"
            d="M0,288L48,256C96,224,192,160,288,144C384,128,480,160,576,186.7C672,213,768,235,864,213.3C960,192,1056,128,1152,106.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="absolute top-4 left-4 z-20">
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

      <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
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
                Welcome Back
              </h1>
              <p className="text-gray-600 mt-2">
                Sign in to your EcoGambia account
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
