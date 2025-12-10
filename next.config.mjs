// next.config.mjs
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*", // proxy hacia FastAPI
      },
    ];
  },
};

export default nextConfig;
