/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        cards: '#1A1A24',
        accent: '#7C6EF8',
        text: '#F0EFF8',
        danger: '#FF4D6A',
        success: '#34D399',
        warning: '#FBBF24',
        border: '#2A2A3A'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
