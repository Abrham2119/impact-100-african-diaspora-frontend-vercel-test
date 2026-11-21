import type { Config } from 'tailwindcss';

// Design tokens exposed as CSS variables (see src/index.css) so light/dark
// themes swap without touching component classes.
//
// Coexistence with the design CSS (ARCHITECTURE.md §1): Tailwind serves only the
// starter screens, which render inside <TwScope> (.tw-root).
//  - preflight off: the reset would restyle every design page. A scoped copy lives
//    in src/styles/tw-scope.css.
//  - important: true: impact100.css bundles Bootstrap 5, whose utilities (p-4, border,
//    rounded, bg-primary …) are `!important` and share names with Tailwind's. Marking
//    Tailwind's utilities important (loaded later) restores the starter's values.
//  - content excludes design code, and the design classes `container`/`collapse` are
//    blocklisted, so Tailwind never emits a class that design markup uses
//    (enforced by `npm run check:css`).
export default {
  darkMode: ['class'],
  important: true,
  corePlugins: { preflight: false },
  blocklist: ['container', 'collapse'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '!./src/components/design/**',
    '!./src/pages/design/**',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
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
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
