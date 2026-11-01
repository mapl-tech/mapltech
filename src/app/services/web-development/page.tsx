import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';
import { serviceMetadata } from '@/components/services/serviceContent';

/* Copy, prices and sources: src/components/services/serviceContent.ts. Template: ServicePage. */
export const metadata: Metadata = {
  ...serviceMetadata('web-development'),
  keywords: [
    'custom web development',
    'agency web development partner',
    'custom-coded websites',
    'headless CMS development',
    'full-stack web development',
    'React web applications',
    'WordPress development for agencies',
    'performance-optimized websites',
    'accessible web development',
    'mobile-first web design',
    'MAPL TECH web development',
  ],
};

export default function WebDevelopmentPage() {
  return <ServicePage slug="web-development" />;
}
