import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';

const DESCRIPTION =
  'MAPL TECH builds intelligent automation and AI workflows that connect your CRM, project tools, invoicing, and client intake into seamless pipelines. Custom AI agents, predictive analytics, and multi-system integrations that eliminate manual busywork for agencies.';

export const metadata: Metadata = {
  title: 'Automation & AI Workflow Setup for Agencies',
  description: DESCRIPTION,
  keywords: [
    'automation for agencies',
    'AI workflow setup',
    'CRM automation',
    'business process automation',
    'AI agents for agencies',
    'workflow automation partner',
    'custom API integrations',
    'predictive analytics',
    'intelligent automation',
    'agency operations automation',
    'MAPL TECH automation',
  ],
  openGraph: {
    title: 'Automation & AI Workflow Setup for Agencies | MAPL TECH',
    description:
      'Intelligent automation and AI workflows that connect your CRM, tools, and client intake into seamless pipelines. Built for agencies.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/automation-ai-workflow-setup',
  },
};

export default function AutomationPage() {
  return <ServicePage slug="automation-ai-workflow-setup" description={DESCRIPTION} />;
}
