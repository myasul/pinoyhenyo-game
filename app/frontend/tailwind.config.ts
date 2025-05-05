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
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        fadeOut: 'fadeIn 0.3s ease-out forwards',
        zoomIn: 'zoomIn 0.3s ease-out forwards',
        zoomOut: 'zoomOut 0.3s ease-out forwards',
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
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.8) translateY(20px) rotate(-2deg)' },
          '100%': { transform: 'scale(1) translateY(0) rotate(0deg)' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1) translateY(20px) rotate(-2deg)' },
          '100%': { transform: 'scale(0.9) translateY(0px) rotate(0deg)' },
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
