/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.pinimg.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
