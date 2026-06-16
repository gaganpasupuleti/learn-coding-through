/** Code Quest Theme Contract — match static/progress/index.html */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app.html', './static/**/*.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF3E0', soft: '#FFF9EA' },
        navy: { DEFAULT: '#0A1020', elevated: '#121A2E' },
        charcoal: '#111827',
        slate: '#708090',
        cta: { DEFAULT: '#2563EB', hover: '#1D4ED8' },
        progress: '#14B8A6',
        gold: '#FBBF24',
        card: {
          yellow: '#F3DFA0',
          pink: '#F5D0DE',
          sage: '#C2CDB0',
          blue: '#B8C9E8',
          lavender: '#DDD0F5',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        shell: '20px',
        card: '18px',
      },
      boxShadow: {
        shell: '0 10px 36px rgba(10, 16, 32, 0.07)',
      },
    },
  },
  plugins: [],
};
