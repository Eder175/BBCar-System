/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",           // Escaneia o index.html na raiz do frontend
    "./pages/**/*.{html,js}", // Escaneia todos os arquivos HTML e JS na pasta pages/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};