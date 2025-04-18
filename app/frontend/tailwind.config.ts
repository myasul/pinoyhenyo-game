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
      },
      animation: {
        wave: 'wave 0.6s ease-out',
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
