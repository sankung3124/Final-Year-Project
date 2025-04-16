/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        primary: {
          DEFAULT: "#18A65C", // Main green color from EcoGambia
          50: "#E6F7EE",
          100: "#CCEEDD",
          200: "#99DDBB",
          300: "#66CC99",
          400: "#33BB77",
          500: "#18A65C", // Primary
          600: "#148A4D",
          700: "#10733F",
          800: "#0C5C32",
          900: "#084624",
        },
        secondary: {
          DEFAULT: "#1A2E3C", // Dark blue color from footer
          50: "#E6EBF0",
          100: "#CCD7E1",
          200: "#99AFC3",
          300: "#6687A5",
          400: "#335F87",
          500: "#1A2E3C", // Secondary
          600: "#172633",
          700: "#131F2A",
          800: "#0F1921",
          900: "#0B1218",
        },
        accent: "#F8F9FA", // Light gray for backgrounds
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(rgba(26, 46, 60, 0.7), rgba(26, 46, 60, 0.7)), url('/images/hero-bg.jpg')",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
