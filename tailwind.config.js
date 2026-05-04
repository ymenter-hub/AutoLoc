/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0A0F',
        'bg-card': '#1E1E2E',
        'accent': '#E8B84B',
        'accent-dim': '#E8B84B22',
        'text-primary': '#F0F0F5',
        'text-muted': '#8888A8',
        'success': '#4CAF82',
        'danger': '#E05252',
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 40px #E8B84B15',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        hue: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        floaty: 'floaty 3s ease-in-out infinite',
        hue: 'hue 8s linear infinite',
      },
    },
  },
  plugins: [],
}
