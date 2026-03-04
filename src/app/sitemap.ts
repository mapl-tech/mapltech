import type { MetadataRoute } from 'next';

const BASE_URL = 'https://mapltech.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/careers',
    '/our-work',
    '/team',
    '/referral',
    '/nigeria',
    '/jamaica',
    '/services/web-development',
    '/services/automation-ai-workflow-setup',
    '/services/custom-internal-tools',
    '/privacy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/services') ? 0.9 : 0.8,
  }));
}
