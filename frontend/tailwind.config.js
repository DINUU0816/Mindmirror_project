/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        emotion: {
          happy: '#fbbf24',
          sad: '#60a5fa',
          angry: '#f87171',
          neutral: '#9ca3af',
          surprise: '#c084fc',
          fear: '#34d399',
          disgust: '#a3e635',
        }
      },
    },
  },
  plugins: [],
}
