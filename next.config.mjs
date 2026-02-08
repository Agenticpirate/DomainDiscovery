/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    process.env.REPLIT_DEV_DOMAIN,
    '127.0.0.1',
  ].filter(Boolean),
};

export default nextConfig;
