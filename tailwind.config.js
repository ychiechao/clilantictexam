/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d9f1ff',
          200: '#bce8ff',
          300: '#8edaff',
          400: '#59c3ff',
          500: '#33a8fc',
          600: '#1d8cf1',
          700: '#1575de',
          800: '#175eb4',
          900: '#194f8e',
          950: '#142f57',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6b10',
        }
      },
      fontFamily: {
        display: ['"Noto Sans TC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
