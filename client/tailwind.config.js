/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2744',
          slate: '#1e3a5f',
          blue: '#1d4ed8',
          teal: '#0d9488',
          light: '#f4f7fb',
          accent: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
