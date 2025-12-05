import type { NextConfig } from "next";
import path from "path";

// Get asset prefix from environment variable (for CDN or custom domain)
// Example: NEXT_PUBLIC_ASSET_PREFIX=https://cdn.example.com
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // Standalone output for server deployment
  // This creates a minimal server.js file that can run independently
  output: "standalone",
  
  // Asset prefix for CDN or custom domain (e.g., https://cdn.example.com)
  // Set NEXT_PUBLIC_ASSET_PREFIX environment variable to enable
  ...(assetPrefix && { assetPrefix }),
  
  // Base path if app is not at root (e.g., /app)
  // Set NEXT_PUBLIC_BASE_PATH environment variable to enable
  ...(basePath && { basePath }),
  
  // Turbopack configuration - set root to workspace root to silence warnings
  // This helps Next.js correctly identify the monorepo root
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  
  // TypeScript configuration
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-09e3e90eed9b4e6198abb65caba89c7e.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-4b9f767f88c94d43be4092d06a3d9151.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
      }
    ],
    // Optimize images for production
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // React strict mode (recommended for production)
  reactStrictMode: true,
  
  // Experimental features (if needed)
  experimental: {
    // Enable if you need server actions
    // serverActions: {
    //   bodySizeLimit: '2mb',
    // },
  },
};

export default nextConfig;
