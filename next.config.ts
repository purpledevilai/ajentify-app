import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false, // Ignore 'child_process' in the client-side build
    };
    return config;
  },
};

export default nextConfig;
