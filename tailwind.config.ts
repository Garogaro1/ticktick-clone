import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderWidth: {
        3: '3px',
      },
      colors: {
        // Warm Claude Theme Palette
        primary: {
          DEFAULT: '#D97757', // terracotta
          light: '#E8B4A3', // soft coral
          dark: '#A85B3F', // deep terracotta
        },
        background: {
          main: '#FCFBF9', // warm cream
          secondary: '#F5F3EF', // darker cream
          card: '#FFFFFF', // pure white
        },
        text: {
          primary: '#2D2A26', // warm dark gray
          secondary: '#6B665F', // muted gray
          tertiary: '#9A958C', // subtle gray
        },
      },
      spacing: {
        // 4px grid system
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
        64: '64px',
        96: '96px',
      },
      borderRadius: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        300: '300ms',
        400: '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
