/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1152d4",
        "primary-dark": "#0d3a96",
        "background-light": "#ffffff",
        "background-dark": "#101622",
        "surface-light": "#f8f9fc",
        "surface-dark": "#1a2234",
        "text-primary": "#0d121b",
        "text-secondary": "#4c669a",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
}