import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

const DESCRIPTION =
  'MAPL TECH builds custom dashboards, client portals, and operations platforms designed around how your agency actually works. Role-based access, real-time analytics, and integrations with your existing stack.';

export const metadata: Metadata = {
  title: 'Custom Internal Tools for Agencies',
  description: DESCRIPTION,
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
  openGraph: {
    title: 'Custom Internal Tools for Agencies | MAPL TECH',
    description:
      'Custom dashboards, client portals, and operations platforms built around how your agency actually works. Not adapted from someone else\'s workflow.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/custom-internal-tools',
  },
};

export default function CustomInternalToolsPage() {
  return <ServicePage slug="custom-internal-tools" description={DESCRIPTION} />;
}
