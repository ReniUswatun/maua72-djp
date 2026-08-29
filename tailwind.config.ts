import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        primary: {
          50: "#F0F4F9",
          100: "#D9E2ED",
          200: "#BCCBDE",
          300: "#8FA9C6",
          400: "#5C81A8",
          500: "#2E5A8A",
          600: "#264C76",
          700: "#1E3F63",
          800: "#163050",
          900: "#0F2340",
          DEFAULT: "#1E3F63",
        },
        accent: {
          50: "#FBF6EC",
          100: "#F6EAD1",
          300: "#E4C68C",
          500: "#D4A24C",
          600: "#B8842E",
          700: "#8F6621",
          DEFAULT: "#D4A24C",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#0EA5E9",
        gray: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 35 64 / 0.04), 0 1px 3px 0 rgb(15 35 64 / 0.06)",
        lift: "0 8px 24px -12px rgb(15 35 64 / 0.18)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
