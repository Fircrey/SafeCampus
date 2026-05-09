import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        tadeo: {
          blue: "#003A70",
          blueDark: "#022B52",
          cyan: "#00C9DB",
          cyanDark: "#0891B2",
          cyanLight: "#E0F7FA",
          cyanMid: "#00A9CE",
          sky: "#00A9CE",
          green: "#78BE20",
          ink: "#1D252D",
          paper: "#F6F8FA"
        },
        cctv: {
          bg: "#0a0e17",
          card: "#111827",
          border: "#1f2937",
          green: "#22c55e",
          greenDim: "#16a34a",
          red: "#ef4444",
          orange: "#f97316",
          blue: "#3b82f6",
          muted: "#6b7280",
          text: "#f1f5f9"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 58, 112, 0.12)",
        cctv: "0 4px 24px rgba(0,0,0,0.6)",
        "card-hover": "0 8px 30px rgba(0, 58, 112, 0.10)",
        "card-elevated": "0 12px 40px rgba(0, 58, 112, 0.14)"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        blink: "blink 1s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.4s ease-out both",
        "slide-down": "slideDown 0.3s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
