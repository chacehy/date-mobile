/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        emerald: {
          900: "#064E3B", // Deep Emerald
          800: "#065F46",
          700: "#047857",
        },
        gold: {
          500: "#D97706", // Gold
          600: "#B45309",
          400: "#F59E0B",
        }
      },
    },
  },
  plugins: [],
}
