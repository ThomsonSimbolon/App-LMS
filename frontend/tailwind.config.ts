import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* -------------------------------------------------
       * COLORS — Nuxt UI–STYLE SEMANTIC SYSTEM
       * ------------------------------------------------- */
      colors: {
        /* Primary (Nuxt UI Indigo) */
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // main
          600: "#4f46e5", // default action
          700: "#4338ca", // hover
          800: "#3730a3",
          900: "#312e81",
        },

        /* Accent / Success */
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },

        /* Neutral — FOUNDATION */
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },

        /* Semantic Status */
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",

        /* Background semantic tokens - NuxtJS style */
        base: "#f0fdfa", // Light: soft mint/green pastel
        "base-dark": "#020617", // Dark: deep slate/blue-black
        hero: "#ecfdf5", // Light: softer mint for hero gradient start
        "hero-dark": "#030712", // Dark: slightly lighter slate for hero
      },

      /* -------------------------------------------------
       * TYPOGRAPHY
       * ------------------------------------------------- */
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },

      /* -------------------------------------------------
       * SPACING & RADIUS
       * ------------------------------------------------- */
      spacing: {
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },

      borderRadius: {
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
      },

      /* -------------------------------------------------
       * SHADOW — NUxt UI SOFT DEPTH
       * ------------------------------------------------- */
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04)",
        card: "0 4px 12px rgba(0,0,0,0.05)",
        "soft-lg": "0 10px 40px -10px rgba(0,0,0,0.1)",
      },

      /* -------------------------------------------------
       * ANIMATION
       * ------------------------------------------------- */
      animation: {
        "fade-in": "fadeIn 0.25s ease-in-out",
        "slide-up": "slideUp 0.25s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
