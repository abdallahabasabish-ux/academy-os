/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizeCss: true,
  },
  // i18n will be handled by the app router
};

module.exports = nextConfig;
