import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF7F2',
          50: '#FDFCFB',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#E8DEC8',
        },
        navy: {
          DEFAULT: '#0B1623',
          800: '#102033',
          900: '#0B1623',
          950: '#070F19',
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#E2BC6B',
          dark: '#B88B38',
          muted: '#C8A97E',
        },
        terracotta: {
          DEFAULT: '#B86B52',
          light: '#D08870',
        },
        charcoal: {
          DEFAULT: '#1E252B',
          muted: '#5A626A',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        script: ['var(--font-great-vibes)', 'cursive'],
      },
      boxShadow: {
        luxury: '0 20px 50px -12px rgba(11, 22, 35, 0.12)',
        'luxury-lg': '0 25px 60px -15px rgba(11, 22, 35, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
