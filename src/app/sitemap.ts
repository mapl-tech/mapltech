import type { MetadataRoute } from 'next';

const BASE_URL = 'https://mapltech.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: {
    path: string;
    changeFrequency: 'weekly' | 'monthly' | 'yearly';
    priority: number;
  }[] = [
    // Homepage
    { path: '', changeFrequency: 'weekly', priority: 1.0 },

    // Core service pages (highest priority after homepage)
    { path: '/services/web-development', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/services/automation-ai-workflow-setup', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/services/custom-internal-tools', changeFrequency: 'monthly', priority: 0.9 },

    // High-value pages
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/our-work', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/about-us', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact-us', changeFrequency: 'monthly', priority: 0.8 },

    // Regional pages
    { path: '/nigeria', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/jamaica', changeFrequency: 'monthly', priority: 0.7 },

    // Supporting pages
    { path: '/careers', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/team', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/referral', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
