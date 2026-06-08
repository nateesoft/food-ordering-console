/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  basePath: '/food-ordering-console',
};

export default nextConfig;
