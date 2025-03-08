import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_AUTH_URL: process.env.API_AUTH_URL,
  },
};

export default nextConfig;
