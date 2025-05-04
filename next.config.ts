// next.config.js

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
};

module.exports = nextConfig;


module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.module.rules.push({
        test: /pdf-parse\/test\/data\/.*\.pdf$/,
        use: 'ignore-loader'
      });
    }
    return config;
  }
};
