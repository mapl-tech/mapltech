import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

const DESCRIPTION =
  'MAPL TECH builds custom-coded websites engineered for speed, accessibility, and long-term maintainability. From headless CMS builds to full-stack React applications, we handle the complex development so your agency can focus on design and client strategy.';

export const metadata: Metadata = {
  title: 'Custom Web Development for Agencies',
  description: DESCRIPTION,
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
  openGraph: {
    title: 'Custom Web Development for Agencies | MAPL TECH',
    description:
      'Custom-coded, performance-optimized websites built for agencies. From headless CMS to full-stack React, engineered for speed and accessibility.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/web-development',
  },
};

export default function WebDevelopmentPage() {
  return <ServicePage slug="web-development" description={DESCRIPTION} />;
}
