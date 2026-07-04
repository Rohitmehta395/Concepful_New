/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Turbopack is the default bundler when running `next dev --turbopack`.
   * No extra configuration is required to enable it — the flag is in package.json scripts.
   *
   * When workspace lib packages (e.g. @workspace/api-client-react, @workspace/db) are
   * imported into this app, add them here so Next.js transpiles their TypeScript source:
   *
   * transpilePackages: [
   *   "@workspace/api-client-react",
   *   "@workspace/api-zod",
   *   "@workspace/db",
   *   "@workspace/object-storage-web",
   * ],
   */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // We do this because Next.js has a known bug with path casing on Windows
    // that causes false positive typecheck failures during next build.
    // We still run `tsc --noEmit` manually in the `typecheck` script to catch real errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
