/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Montserrat"', '"Nunito Sans"', '"Avenir Next"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        brand: ['"Quottery"', 'serif'],
        tech: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Avenir Next"', '"Nunito Sans"', 'sans-serif'],
        mono: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Avenir Next"', '"Nunito Sans"', 'sans-serif']
      },
      colors: {
        alves: {
          dark: '#1B1410',
          darkSurface: '#231B15',
          gold: '#C5A265',
          goldDark: '#9E7E45',
          goldLight: '#DFC28B',
          bg: '#FAF8F5',
          border: '#E8E2D9',
          muted: '#6E645C'
        },
        libus: {
          // Cores Oficiais do Manual de Marca Libus (Pantone)
          magenta: '#E5004D',      // PANTONE 1925 C (Cor Primária Símbolo)
          magentaHover: '#C70043',
          charcoal: '#0F141F',     // PANTONE Black 6 C (Dark Canvas / Base)
          slate: '#1A2130',        // Dark Surface
          gray: '#35393B',         // PANTONE 447 C (Neutral Dark)
          lightGray: '#F4F6F8',    // Background Surface
          blue: '#002B49',         // Deep Industrial Blue
          lightBlue: '#0070BA',    // Technical Accent Blue
          accent: '#E5004D',       // Primary Action = Libus Carmine
          yellow: '#FFB800',       // Warning / Technical Highlight
          border: '#E2E8F0'
        }
      }
    },
  },
  plugins: [],
}
