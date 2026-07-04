/**
 * PostCSS configuration for Tailwind CSS v4 with Next.js.
 *
 * Tailwind v4 uses @tailwindcss/postcss (not a tailwind.config.js file).
 * This is the correct integration point for Next.js, which processes CSS
 * through PostCSS during both development (Turbopack) and production builds.
 *
 * The existing Vite app uses @tailwindcss/vite (Vite plugin) — that plugin
 * does NOT work with Next.js. @tailwindcss/postcss is the equivalent for all
 * non-Vite environments.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
