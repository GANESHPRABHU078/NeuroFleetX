/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#667eea",
          50: "#f5f7ff",
          100: "#ebf0ff",
          200: "#d6e0ff",
          300: "#b3c5ff",
          400: "#8da5ff",
          500: "#667eea",
          600: "#5562d9",
          700: "#4449b8",
          800: "#333494",
          900: "#222370",
        },
        secondary: {
          DEFAULT: "#764ba2",
          50: "#f9f5ff",
          100: "#f3ebff",
          200: "#e7d6ff",
          300: "#d6b8ff",
          400: "#b88fff",
          500: "#9966ff",
          600: "#764ba2",
          700: "#5f3c82",
          800: "#472d62",
          900: "#2f1e42",
        },
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
