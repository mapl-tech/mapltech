import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';
import { serviceMetadata } from '@/components/services/serviceContent';

/* Copy, prices and sources: src/components/services/serviceContent.ts. Template: ServicePage. */
export const metadata: Metadata = {
  ...serviceMetadata('custom-internal-tools'),
  keywords: [
    'custom internal tools',
    'agency dashboards',
    'client portal development',
    'custom business tools',
    'internal dashboard development',
    'operations platform',
    'reporting systems for agencies',
    'role-based access tools',
    'custom software development',
    'agency operations tools',
    'MAPL TECH internal tools',
  ],
};

export default function CustomInternalToolsPage() {
  return <ServicePage slug="custom-internal-tools" />;
}
