/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#1E40AF',
        'soft-teal': '#0D9488',
        'alert-red': '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
