/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#5f9dca',
          500: '#3a80b5',
          600: '#296696',
          700: '#21527a',
          800: '#1d4566',
          900: '#0f2b48',
          950: '#091a2d',
        },
        brand: {
          primary: '#0f2b48',
          secondary: '#1e3a8a',
          accent: '#2563eb',
          light: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#64748b',
        }
      }
    },
  },
  plugins: [],
}

