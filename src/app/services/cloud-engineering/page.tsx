import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';
import { serviceMetadata } from '@/components/services/serviceContent';

/* Copy, prices and sources: src/components/services/serviceContent.ts. Template: ServicePage. */
export const metadata: Metadata = {
  ...serviceMetadata('cloud-engineering'),
  keywords: [
    'cloud engineering',
    'cloud infrastructure',
    'AWS for agencies',
    'GCP cloud setup',
    'Azure infrastructure',
    'CI/CD pipelines',
    'Infrastructure as Code',
    'DevOps for agencies',
    'cloud migration',
    'cloud cost optimization',
    'MAPL TECH cloud engineering',
  ],
};

export default function CloudEngineeringPage() {
  return <ServicePage slug="cloud-engineering" />;
}
