/* ============================================================
   Tailwind Config — Fissionaire Brand Tokens
   NOTE: Tailwind v4 uses CSS-based configuration (@theme in globals.css).
   This file provides IDE support and documents all brand tokens.
   The actual runtime config is in app/globals.css via @theme inline.
   ============================================================ */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: "#0B0B0B",
          card: "#1A1A1A",
          raised: "#1F1F1F",
          interactive: "#232323",
        },
        // Text
        text: {
          primary: "#e8e6e3",
          secondary: "#a8a5a0",
          muted: "#706d68",
        },
        // Blue spectrum
        blue: {
          flat: "#00B7FF",
          start: "#018DFF",
          end: "#02A2FE",
        },
        // Orange spectrum
        orange: {
          flat: "#F26522",
          start: "#F47E20",
          end: "#EF4C23",
        },
        // Accents
        lime: {
          DEFAULT: "#C0FF9E",
          deep: "#9ECC7E",
        },
        magenta: "#CC66FF",
        // Category colors
        cat: {
          regulatory: "#018DFF",
          commercial: "#F26522",
          "supply-chain": "#C0FF9E",
          sentiment: "#CC66FF",
          investment: "#02A2FE",
          policy: "#F47E20",
          technical: "#9ECC7E",
          competitor: "#EF4C23",
        },
        // Urgency colors
        urgency: {
          critical: "#EF4C23",
          high: "#F47E20",
          medium: "#02A2FE",
          low: "#706d68",
        },
        // Relevance colors
        relevance: {
          direct: "#C0FF9E",
          adjacent: "#02A2FE",
          market: "#F47E20",
          background: "#706d68",
        },
        // Border colors
        border: {
          default: "rgba(255, 255, 255, 0.10)",
          subtle: "rgba(255, 255, 255, 0.06)",
          strong: "rgba(255, 255, 255, 0.15)",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.4)",
        "glow-blue": "0 0 20px rgba(0, 183, 255, 0.15)",
        "glow-orange": "0 0 20px rgba(242, 101, 34, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
