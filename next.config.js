/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "sharp"],
  },
};

module.exports = nextConfig;
