/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          50: '#1a1a1a',
          100: '#111111',
          200: '#0d0d0d',
          300: '#080808',
          400: '#050505',
          500: '#000000',
        },
        primary: '#FFFFFF',
        secondary: 'rgba(255,255,255,0.62)',
        muted: 'rgba(255,255,255,0.42)',
        border: {
          DEFAULT: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.22)',
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
