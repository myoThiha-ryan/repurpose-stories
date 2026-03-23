import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger request bodies for video uploads (250MB)
  experimental: {
    serverBodySizeLimit: '250mb',
  },
};

export default nextConfig;
