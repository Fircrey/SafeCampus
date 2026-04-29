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
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 58, 112, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
