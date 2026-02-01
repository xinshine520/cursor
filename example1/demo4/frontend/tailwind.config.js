/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0A0F1D',
        'tech-blue': '#2563EB',
        'tech-blue-dark': '#1D4ED8',
        'aurora-purple': '#7C3AED',
        'success-green': '#10B981',
        'warning-orange': '#F59E0B',
        'neutral-gray': '#6B7280',
        'text-dark': '#111827',
        'bg-light': '#F9FAFB',
        'code-bg': '#1F2937',
        'code-text': '#9CA3AF',
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1)',
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}

