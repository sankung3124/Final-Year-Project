import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthSessionProvider from "@/context/AuthProvider";
import { AuthProvider } from "@/hooks/useAuth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "EcoGambia - Sustainable Waste Management",
  description:
    "Join the movement for a cleaner Gambia with sustainable waste management solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider> */}
        <AuthSessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
