import type { Metadata } from 'next';
import ServicePage from '@/components/services/ServicePage';
import { serviceMetadata } from '@/components/services/serviceContent';

/* Copy, prices and sources: src/components/services/serviceContent.ts. Template: ServicePage. */
export const metadata: Metadata = {
  ...serviceMetadata('automation-ai-workflow-setup'),
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
};

export default function AutomationPage() {
  return <ServicePage slug="automation-ai-workflow-setup" />;
}
