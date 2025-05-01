/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Use standard build instead of export to simplify
  // output: 'export',
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com', 'placehold.co', 'localhost'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', '@chakra-ui/icons', 'react-icons'],
  },
  // Skip type checking on build to expedite export
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint to expedite export
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable standalone output for hosting
  output: 'standalone',
};

module.exports = nextConfig; 