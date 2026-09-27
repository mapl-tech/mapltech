import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

const DESCRIPTION =
  'MAPL TECH designs, deploys, and manages cloud infrastructure that scales with your agency. From CI/CD pipelines and Infrastructure as Code to multi-region deployments and cost optimization - we handle the cloud so you can focus on your clients.';

export const metadata: Metadata = {
  title: 'Cloud Engineering for Agencies',
  description: DESCRIPTION,
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
  openGraph: {
    title: 'Cloud Engineering for Agencies | MAPL TECH',
    description:
      'Scalable cloud infrastructure designed, deployed, and managed for agencies. CI/CD pipelines, IaC, monitoring, and security built right.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/cloud-engineering',
  },
};

export default function CloudEngineeringPage() {
  return <ServicePage slug="cloud-engineering" description={DESCRIPTION} />;
}
