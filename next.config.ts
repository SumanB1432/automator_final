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

  // Optionally, disable React strict mode
  reactStrictMode: false,

  // Add image domains for next/image
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com', // Add Firebase Storage
    ],
  },
};

module.exports = nextConfig;