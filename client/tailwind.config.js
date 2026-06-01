/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        secondary: 'rgb(var(--secondary-bg))',
        canvas: {
          DEFAULT: '#f9f9f8',
          dark:    '#080808',
        },
        accent: {
          DEFAULT: '#3b82f6',
          blue: '#3b82f6',
          orange: '#f97316'
        },
        whatsapp: '#25D366'
      },
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
