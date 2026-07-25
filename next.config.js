/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // 💡 ຫຼຸດ Thread/Process ໃຫ້ເບົາບາງທີ່ສຸດ
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;