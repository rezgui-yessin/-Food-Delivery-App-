/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5722',
          hover: '#F4511E',
          light: '#FF8A65',
          dark: '#E64A19',
          50: '#FBE9E7',
          100: '#FFCCBC',
          500: '#FF5722',
          600: '#F4511E',
          700: '#E64A19'
        },
        accent: {
          DEFAULT: '#FF9800',
          hover: '#FB8C00'
        },
        delivery: {
          DEFAULT: '#10B981',
          hover: '#059669'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
        'bounce-short': 'bounce 0.6s ease-in-out 2'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}

