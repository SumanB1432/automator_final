/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optionally silence Webpack warnings
  webpack(config, { dev, isServer }) {
    config.ignoreWarnings = [
      () => true, // Ignores all warnings
    ];
    return config;
  },

  // Optionally, disable React strict mode (to suppress dev warnings)
  reactStrictMode: false,

  // Add image domains for next/image
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;