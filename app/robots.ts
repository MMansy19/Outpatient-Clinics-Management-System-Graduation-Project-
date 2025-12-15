import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medistream-ocms.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*/login', '/*/register', '/*/admin', '/*/doctor'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
