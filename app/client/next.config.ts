import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  env: {
    API_AUTH_URL: process.env.API_AUTH_URL,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all domains
      },
      {
        protocol: "http",
        hostname: "**", // allow all domains (http too, if needed)
      },
    ],
  },
};

export default nextConfig;
