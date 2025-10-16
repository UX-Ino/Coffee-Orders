/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'passorder-static.passorder.site' },
      { protocol: 'https', hostname: 'static-cdn.passorder.site' },
      { protocol: 'https', hostname: 'noticon-static.tammolo.com' },
    ],
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default nextConfig;
