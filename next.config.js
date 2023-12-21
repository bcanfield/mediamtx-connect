/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/app",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/app",
        basePath: false,
        permanent: false,
      },
    ];
  },
  reactStrictMode: false,
  swcMinify: true,
  output: "standalone",
  experimental: {
    instrumentationHook: true,
    webpackBuildWorker: true,
  },
  webpack: (config, { webpack }) => {
    // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-1629414369
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.FLUENTFFMPEG_COV": false,
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
