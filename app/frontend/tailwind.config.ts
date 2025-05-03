import type { Config } from "tailwindcss";

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fil: {
          yellow: '#FFF4B8',
          blue: '#B8D8FF',
          red: '#FFB8B8',
          white: '#FDFDFD',
          darkText: '#2B2B2B',
          deepBlue: '#0038A8',
          deepRed: '#CE1126',
          deepYellow: '#FCD116'
        },
      },
      animation: {
        wave: 'wave 0.6s ease-out',
        spin: 'spin 2s linear infinite',
      },
      keyframes: {
        wave: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translateX(0%)',
            opacity: '0.2',
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
