/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1120", light: "#131B2E" },
        gold: "#C9A227",
        slate: { soft: "#7C8DB5" },
        paper: "#EEF1F6",
        ink: "#10192B",
        border: "#D7DEE8",
        positive: "#34D399",
        negative: "#F87171",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};