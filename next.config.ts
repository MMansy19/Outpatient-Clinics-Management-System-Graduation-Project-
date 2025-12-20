import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // API Proxy to avoid CORS issues in development
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api-gateway.salmoncoast-a5f57a4d.westus2.azurecontainerapps.io/api/v1/:path*',
      },
    ];
  },
  
  // Image optimization for medical scans/photos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.codeblue.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.koruux.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Security headers for HIPAA compliance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
