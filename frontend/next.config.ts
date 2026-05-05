import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow your local network IP to access the dev server
  allowedDevOrigins: ['192.168.31.96'],
};

export default nextConfig;
