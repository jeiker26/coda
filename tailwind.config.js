/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'menubar-bg': 'rgba(30, 30, 30, 0.95)',
        'menubar-border': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
