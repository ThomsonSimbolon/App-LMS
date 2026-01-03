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
       * COLORS — CRYPTO / MODERN SAAS STYLE
       * Standardized color system with full light/dark support
       * ------------------------------------------------- */
      colors: {
        /* Primary - Blue CTA / Active states */
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa", // dark hover
          500: "#3b82f6", // main CTA
          600: "#3b82f6", // default action (same as 500 for consistency)
          700: "#2563eb", // light hover
          800: "#1d4ed8",
          900: "#1e40af",
        },

        /* Secondary - Indigo */
        secondary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // main
          600: "#6366f1",
          700: "#4f46e5",
          800: "#4338ca",
          900: "#3730a3",
        },

        /* Accent - Violet */
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6", // main
          600: "#8b5cf6",
          700: "#7c3aed",
          800: "#6d28d9",
          900: "#5b21b6",
        },

        /* Slate - Foundation for text/borders (replacing neutral & gray) */
        slate: {
          50: "#f8fafc", // text main light
          100: "#f1f5f9",
          200: "#e2e8f0", // border light
          300: "#cbd5e1", // text body dark
          400: "#94a3b8", // text muted dark
          500: "#64748b", // text muted light
          600: "#475569", // text body light
          700: "#334155",
          800: "#1e293b", // border dark
          900: "#0f172a", // bg card/surface dark
          950: "#020617",
        },

        /* Neutral - For compatibility (maps to slate) */
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },

        /* Semantic Status */
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",

        /* Background semantic tokens - Crypto/SaaS style */
        base: "#f8faff", // Light: main background
        "base-dark": "#0b1220", // Dark: main background
        surface: "#ffffff", // Light: card/surface
        "surface-dark": "#111827", // Dark: card/surface
        soft: "#eef2ff", // Light: soft background
        "soft-dark": "#0f172a", // Dark: soft background (same as card)
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
