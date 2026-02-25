/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization - use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Transpile specific packages if needed
  transpilePackages: ['undici'],

  // Webpack configuration for handling private fields
  webpack: (config, { isServer }) => {
    // Handle private fields in undici
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
}

module.exports = nextConfig
