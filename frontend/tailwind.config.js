/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orbital-bg': '#070D16',
        'orbital-surface': '#0B1523',
        'orbital-card': '#0E1A2B',
        'orbital-border': '#182A40',
        'orbital-border-light': '#223A57',
        'orbital-cyan': '#00E5FF',
        'orbital-teal': '#14B8A6',
        'orbital-blue': '#2563EB',
        'orbital-green': '#10B981',
        'orbital-text-0': '#FFFFFF',
        'orbital-text-1': '#94A3B8',
        'orbital-text-2': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
