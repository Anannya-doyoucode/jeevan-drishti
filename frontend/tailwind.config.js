/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: {
          900: '#070C15',
          800: '#0B1220', // Government Deep Navy Header
          700: '#152033',
          600: '#1E2D47',
        },
        govTeal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          300: '#5EEAD4',
          400: '#2DD4BF', // Primary Teal Accent
          500: '#14B8A6',
          600: '#0D9488',
        },
        risk: {
          high: '#E76F51',     // High Risk Coral
          moderate: '#E9B949', // Moderate Yellow
          low: '#34A853',      // Low Risk Green
          missing: '#94A3B8',  // Slate Gray for Missing Data
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-radar': 'radarPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'blink-slow': 'blink 1.5s ease-in-out infinite',
      },
      keyframes: {
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
