import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        school: {
          teal: '#20A6A5',
          'teal-dark': '#178180',
          'teal-light': '#e6f7f7',
          blue: '#006BB6',
          'blue-light': '#e6f0f9',
        },
      },
    },
  },
  plugins: [],
};

export default config;
