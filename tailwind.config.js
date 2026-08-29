/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#151f38',
          750: '#1b2746',
          700: '#223259',
          600: '#334774',
        },
        brand: {
          cyan: '#38bdf8',
          blue: '#3b82f6',
          emerald: '#10b981',
          green: '#22c55e',
          purple: '#a855f7',
          pink: '#ec4899',
          amber: '#f59e0b',
          red: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
