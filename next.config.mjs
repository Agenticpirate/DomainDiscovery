/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    `https://${process.env.REPLIT_DEV_DOMAIN || ''}`,
    'https://127.0.0.1',
  ],
};

export default nextConfig;
