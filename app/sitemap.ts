import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medistream-ocms.vercel.app';
  
  const routes = [
    '',
    '/en',
    '/ar',
    '/en/login',
    '/ar/login',
    '/en/register',
    '/ar/register',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/en' || route === '/ar' ? 1 : 0.8,
  }));
}
