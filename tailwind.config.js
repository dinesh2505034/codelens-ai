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
        app: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        border: 'var(--border-color)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        accent: {
          DEFAULT: '#5B6CFF',
          hover: 'var(--accent-hover)',
          active: 'var(--accent-active)',
          subtle: 'var(--accent-subtle)',
          border: 'var(--accent-border)',
          ring: 'var(--accent-ring)'
        },
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          'success-border': 'var(--status-success-border)',
          error: 'var(--status-error)',
          'error-bg': 'var(--status-error-bg)',
          'error-border': 'var(--status-error-border)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          'warning-border': 'var(--status-warning-border)'
        },
        // Maintain backwards compatibility with existing utility classes
        dark: {
          950: '#0B0D10',
          900: '#12151A',
          850: '#181C22',
          800: '#181C22',
          750: '#232830',
          700: '#232830',
          600: '#8B93A0',
        }
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '12px'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'Menlo', 'monospace']
      },
      boxShadow: {
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
