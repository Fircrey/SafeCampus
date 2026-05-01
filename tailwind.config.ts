import type { Config } from "tailwindcss";

const config: Config = {
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
          yellow: "#FFD200",
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
        cctv: "0 4px 24px rgba(0,0,0,0.6)"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" }
        }
      },
      animation: {
        blink: "blink 1s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
