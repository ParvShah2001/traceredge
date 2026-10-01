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
          DEFAULT: '#ffffff',
          light: '#ffffff',
          dark: '#e4e4e7',
          glow: 'rgba(255, 255, 255, 0.08)',
        },
        bear: {
          DEFAULT: '#888888',
          light: '#a1a1aa',
          dark: '#52525b',
          glow: 'rgba(255, 255, 255, 0.04)',
        },
        dark: {
          950: '#000000',
          900: '#0a0a0a',
          850: '#121212',
          800: '#1c1c1c',
          750: '#262626',
          700: '#333333',
          600: '#525252',
        }
      },
      animation: {
        'tick-up': 'flashUp 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
        'tick-down': 'flashDown 0.8s cubic-bezier(0.4, 0, 0.6, 1)',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flashUp: {
          '0%': { backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashDown: {
          '0%': { backgroundColor: 'rgba(120, 120, 120, 0.2)', color: '#a1a1aa' },
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
