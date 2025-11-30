/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export a static HTML build suitable for itch.io or any static host
  output: 'export',
  // Use relative asset paths so the build works when hosted from a subdirectory (e.g., itch.io CDN path)
  assetPrefix: './',
  trailingSlash: true
};

export default nextConfig;
