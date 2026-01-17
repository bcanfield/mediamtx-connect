/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
