/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxurious dark theme colors
        primary: {
          50: '#f8f7f4',
          100: '#f0ede6',
          200: '#e1d9cc',
          300: '#d2c4aa',
          400: '#b89f7a',
          500: '#a8875a',
          600: '#967545',
          700: '#7d5f3b',
          800: '#654b32',
          900: '#533e2b',
          950: '#3a2a1e',
        },
        secondary: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6b6b6b',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#262626',
        },
        accent: {
          gold: '#d4af37',
          bronze: '#cd7f32',
          copper: '#b87333',
        }
      },
      fontFamily: {
        serif: ['Crimson Text', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #b87333 100%)',
      },
      boxShadow: {
        'luxury': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'luxury-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
