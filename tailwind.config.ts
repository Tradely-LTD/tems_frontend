import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'midnight-navy': '#00113a',
        'royal-navy': '#002366',
        'periwinkle': '#758dd5',
        'soft-denim': '#435b9f',
        'institutional-emerald': '#096c4b',
        'mint-container': '#9ff4c9',
        'deep-forest': '#002114',
        'official-gold': '#D4AF37',
        'valid-green': '#107C10',
        'caution-gold': '#F1C40F',
        'stop-red': '#D83B01',
        'error-crimson': '#ba1a1a',
        'ghost-white': '#faf8ff',
        'ice-grey': '#f4f3f9',
        'soft-mist': '#efedf3',
        'silver-border': '#c5c6d2',
        'steel-ink': '#444650',
        'jet-text': '#1a1b20',
        'slate-deep': '#0F172A',
        'slate-mid': '#475569',
        'pure-white': '#ffffff',
      },
      fontFamily: {
        sans: ['Public Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-lg':      ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'headline-lg':     ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'title-md':        ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg':         ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm':         ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps':      ['12px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.05em' }],
        'mono-id':         ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },
      maxWidth: { 'screen-xl': '1440px' },
      borderRadius: { DEFAULT: '4px' },
    },
  },
  plugins: [],
};

export default config;
