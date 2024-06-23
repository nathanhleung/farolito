/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf2pic", "pdf-lib"],
  },
};

export default nextConfig;
