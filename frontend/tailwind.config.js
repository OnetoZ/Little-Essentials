/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3E9D7',
        cappuccino: '#D6BFA6',
        caramel: '#B08968',
        mocha: '#7A553A',
        espresso: '#3B2A22',
        'cream-light': '#F9F4EC',
        'espresso-8': 'rgba(59, 42, 34, 0.08)',
        'espresso-4': 'rgba(59, 42, 34, 0.04)',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        ultra: '0.25em',
        'wide-2': '0.08em',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
      },
    },
  },
  plugins: [],
}
