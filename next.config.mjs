/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['mongodb'], // Fixed from experimental.serverComponentsExternalPackages
  eslint: {
    ignoreDuringBuilds: true, // Consider changing to false for production
  },
  typescript: {
    ignoreBuildErrors: true, // Consider changing to false for production
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

