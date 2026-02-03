import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      // Mobile-first breakpoints
      xs: '375px', // Small phones
      sm: '640px', // Large phones
      md: '768px', // Tablets
      lg: '1024px', // Small laptops
      xl: '1280px', // Laptops
      '2xl': '1536px', // Large screens
    },
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
      minHeight: {
        '16': '4rem', // 64px - minimum tap target
        '12': '3rem', // 48px - comfortable tap target
        '11': '2.75rem', // 44px - WCAG recommended minimum
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};

export default config;
