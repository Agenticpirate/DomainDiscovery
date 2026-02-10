/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN,
    '127.0.0.1',
  ].filter(Boolean),
    eslint: {
          ignoreDuringBuilds: true,
        },
};

export default nextConfig;
