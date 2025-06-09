/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brandPrimary: { // Sky Blue
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brandAccent: { // Amber
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
        brandNeutral: { // Slate
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        brandPageBg: '#f8fafc',
        brandTextPrimary: '#1e293b',
        brandTextSecondary: '#475569',
        brandFunctionalRed: '#ef4444',
      },
      animation: {
        'ping-slow': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-very-subtle': 'ping-very-subtle-kf 3.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-down': 'slide-down-kf 0.2s ease-out forwards',
        'popover-appear': 'popover-appear-kf 0.15s ease-out forwards',
        'pulse-glow': 'pulse-glow-kf 1.5s ease-out 1',
        'shrink-fade-out': 'shrink-fade-out-kf 0.3s ease-out forwards',
      },
      keyframes: {
        'ping-very-subtle-kf': {
          '75%, 100%': {
            transform: 'scale(1.15)',
            opacity: '0',
          },
        },
        'slide-down-kf': {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px) scaleY(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scaleY(1)',
          },
        },
        'popover-appear-kf': {
          'from': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'pulse-glow-kf': {
          '0%': { boxShadow: '0 0 0 0px rgba(2, 132, 199, 0.0)' },
          '50%': { boxShadow: '0 0 8px 10px rgba(2, 132, 199, 0.3)' },
          '100%': { boxShadow: '0 0 0 0px rgba(2, 132, 199, 0.0)' },
        },
        'shrink-fade-out-kf': {
          '0%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.5)',
          },
        },
      }
    },
  },
  plugins: [],
}
