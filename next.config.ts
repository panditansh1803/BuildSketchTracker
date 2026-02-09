import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: In Next.js 16+, eslint config is no longer supported in next.config.ts
  // ESLint is controlled via CLI options: https://nextjs.org/docs/app/api-reference/cli/next#next-lint-options
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  compress: true, // Enable Gzip compression
  // swcMinify: true, // DEPRECATED in Next.js 15+ (Default is true)
  /* Performance Optimizations */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // Enable Partial Pre-rendering for faster page loads (Next 15+)
    // ppr: true, // Uncomment if on Next.js 15+
    optimizeCss: true, // Minify CSS
  },
  images: {
    // Add any external image domains here if needed
    remotePatterns: [],
  },

  // Caching & Headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
