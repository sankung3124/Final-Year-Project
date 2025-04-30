import { MapPin } from "lucide-react";
import OnboardingForm from "@/components/auth/OnBordingForm";

export const metadata = {
  title: "Complete Your Profile - EcoGambia",
  description: "Complete your profile setup to get the most out of EcoGambia",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/80 to-primary relative">
      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#FFFFFF"
            fillOpacity="0.3"
            d="M0,128L48,138.7C96,149,192,171,288,181.3C384,192,480,192,576,181.3C672,171,768,149,864,160C960,171,1056,213,1152,229.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-secondary">
                Almost There!
              </h1>
              <p className="text-gray-600 mt-2">
                Let us know your location to tailor your experience
              </p>
            </div>

            <OnboardingForm />
          </div>
        </div>
      </div>
    </div>
  );
}
