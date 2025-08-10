import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_AUTH_URL: process.env.API_AUTH_URL,
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
