/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cherry: '#C0392B',
        'cherry-dark': '#922B21',
        cream: '#FAF7F2',
        'cream-dark': '#F0EAE0',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
        border: '#E0D9D0',
        success: '#1A7F4B',
        warning: '#B7791F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
