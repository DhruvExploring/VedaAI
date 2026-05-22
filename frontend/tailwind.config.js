/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        bricolage: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f4f3f0',
          100: '#e8e6e0',
          200: '#d0ccc0',
          300: '#b0a999',
          400: '#887e6e',
          500: '#6b6055',
          600: '#564e45',
          700: '#403a33',
          800: '#2a2520',
          900: '#1a1713',
          950: '#0d0b09',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        sage: {
          50: '#f0f4f0',
          100: '#dce8dc',
          200: '#b8d1b8',
          300: '#8db48d',
          400: '#6a9a6a',
          500: '#4f7f4f',
          600: '#3d6b3d',
          700: '#2d522d',
          800: '#1f3a1f',
          900: '#122112',
        },
        coral: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
