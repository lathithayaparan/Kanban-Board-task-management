import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Stop `next dev` from generating an AGENTS.md file for AI coding tools.
  agentRules: false,
};

export default nextConfig;
