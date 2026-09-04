import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
foreground: 'hsl(var(--foreground))',

card: {
  DEFAULT: 'hsl(var(--card))',
  foreground: 'hsl(var(--card-foreground))',
},

popover: {
  DEFAULT: 'hsl(var(--popover))',
  foreground: 'hsl(var(--popover-foreground))',
},

primary: {
  DEFAULT: 'hsl(var(--primary))',
  foreground: 'hsl(var(--primary-foreground))',
},

secondary: {
  DEFAULT: 'hsl(var(--secondary))',
  foreground: 'hsl(var(--secondary-foreground))',
},

muted: {
  DEFAULT: 'hsl(var(--muted))',
  foreground: 'hsl(var(--muted-foreground))',
},

destructive: {
  DEFAULT: 'hsl(var(--destructive))',
  foreground: 'hsl(var(--destructive-foreground))',
},

border: 'hsl(var(--border))',
input: 'hsl(var(--input))',
ring: 'hsl(var(--ring))',
        accent: {
          DEFAULT: '#6C63FF',
          50: '#F0EEFF',
          100: '#E0DDFF',
          200: '#C9C1FF',
          300: '#A89BFF',
          400: '#8B75FF',
          500: '#6C63FF',
          600: '#5854E8',
          700: '#4842C4',
          800: '#3D36A0',
          900: '#342D80',
        },
        accent2: {
          DEFAULT: '#00C9A7',
          50: '#DDFAF3',
          100: '#BBF5E7',
          200: '#85EACE',
          300: '#4FDDB1',
          400: '#26CF9A',
          500: '#00C9A7',
          600: '#00A88A',
          700: '#00866E',
          800: '#006553',
          900: '#004A41',
        },
        accent3: {
          DEFAULT: '#FF6B6B',
          50: '#FFE8E8',
          100: '#FFD1D1',
          200: '#FFA3A3',
          300: '#FF7575',
          400: '#FF6B6B',
          500: '#FF6B6B',
          600: '#E05252',
          700: '#B84242',
          800: '#903535',
          900: '#732A2A',
        },
        accent4: {
          DEFAULT: '#FFB830',
          50: '#FFF4E0',
          100: '#FFE8C1',
          200: '#FFD183',
          300: '#FFBA45',
          400: '#FFB830',
          500: '#FFB830',
          600: '#E6A028',
          700: '#B87F20',
          800: '#8C6018',
          900: '#6E4C12',
        },
        bg: '#F0EFF8',
        surface: '#FFFFFF',
        card2: '#F7F6FF',
        text: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        DEFAULT: '0 2px 12px rgba(108, 99, 255, 0.09)',
        lg: '0 4px 20px rgba(108, 99, 255, 0.12)',
        xl: '0 8px 30px rgba(108, 99, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;