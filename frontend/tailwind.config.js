/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        accent: 'var(--accent)',
        change: 'var(--change)',
        boundary: 'var(--boundary)',
        ok: 'var(--ok)',
        flag: 'var(--flag)',
        // Maintain backward compatibility aliases mapped to new tokens
        'orbital-bg': 'var(--bg)',
        'orbital-surface': 'var(--surface)',
        'orbital-card': 'var(--raised)',
        'orbital-border': 'var(--border)',
        'orbital-border-light': 'var(--border)',
        'orbital-cyan': 'var(--accent)',
        'orbital-text-0': 'var(--text)',
        'orbital-text-1': 'var(--text-2)',
        'orbital-text-2': 'var(--text-2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-data)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        ui: ['var(--font-ui)', 'Inter', 'system-ui', 'sans-serif'],
        data: ['var(--font-data)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.4)',
        DEFAULT: '0 1px 2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
