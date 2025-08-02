import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_AUTH_URL: process.env.API_AUTH_URL,
  },
  images: {
    domains: ["s3.amazonaws.com", "s3.amazonaaws.com"],
  },
};

export default nextConfig;
