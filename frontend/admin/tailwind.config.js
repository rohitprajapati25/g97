/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#050507',
        darker: '#0a0f18',
        darknav: '#0a0a0c',
        primary: '#d9302c',
        secondary: '#1E3A8A'
      },
    },
  },
  plugins: [],
};
