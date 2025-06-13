/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-brown': '#2E1A00', // A deep, rich brown
        'dark-red': '#6F0000',   // A deep, muted red
        'gold': '#FFD700',       // Classic gold
        'light-gold': '#FFF5A6', // A lighter shade of gold for text accents
        'warm-gray': '#A8A29E', // A warm gray for secondary text
      },
    },
  },
  plugins: [],
}
