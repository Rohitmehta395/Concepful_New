import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint flat config for Next.js 15 (ESLint 9).
 *
 * Extends:
 *   - next/core-web-vitals  → Core Web Vitals + accessibility rules
 *   - next/typescript        → TypeScript-aware Next.js rules
 *
 * This mirrors what `create-next-app` generates for Next.js 15.
 * Additional rules can be added here as the project grows.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
