/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 💡 ຂ້າມ Type Check ຕອນ Build ຢູ່ Hostinger
    ignoreBuildErrors: true,
  },
  eslint: {
    // 💡 ຂ້າມ ESLint Warnings ຕອນ Build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;