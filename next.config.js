/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  // للإنتاج (Static Export) نفعله لاحقاً، اتركه كما هو للتطوير
  experimental: {
    optimizeCss: true,
  },
  // دعم الترجمة (i18n) نضيفه لاحقاً
};

module.exports = nextConfig;
