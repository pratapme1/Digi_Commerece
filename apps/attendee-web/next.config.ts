import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@digi/api-contracts", "@digi/design-tokens", "@digi/domain"],
};

export default nextConfig;
