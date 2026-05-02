/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        trust: {
          DEFAULT: '#1B4F72',
          light: '#2E86C1',
          muted: '#D6EAF8',
        },
        give: {
          DEFAULT: '#27AE60',
          dark: '#1E8449',
          light: '#D5F5E3',
        },
        warm: {
          DEFAULT: '#E67E22',
          light: '#FDEBD0',
        },
        ivory: {
          DEFAULT: '#FDFAF5',
          dark: '#F0EAE0',
        },
        charcoal: {
          DEFAULT: '#2C3E50',
          muted: '#7F8C8D',
        },
        urgent: {
          DEFAULT: '#C0392B',
          light: '#FADBD8',
        },
        /** Card dividers, subtle borders */
        divider: '#E0D9D0',
        /** Form input borders */
        form: '#BDC3C7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
