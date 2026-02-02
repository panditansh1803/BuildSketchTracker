import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
