/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  // Forzamos a que cargue al menos un par de temas para asegurar que las variables de color existan
  daisyui: {
    themes: ["light", "dark"], 
  },
}