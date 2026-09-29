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
        bull: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        bear: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          glow: 'rgba(239, 68, 68, 0.15)',
        },
        dark: {
          950: '#070b12',
          900: '#0b111e',
          850: '#0f172a',
          800: '#141e33',
          750: '#1a2742',
          700: '#1e293b',
          600: '#334155',
        }
      },
      animation: {
        'tick-up': 'flashUp 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
        'tick-down': 'flashDown 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flashUp: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.35)', color: '#34d399' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashDown: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.35)', color: '#f87171' },
          '100%': { backgroundColor: 'transparent' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
