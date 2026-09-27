import type { Metadata } from 'next';
import RegionalPage from '@/components/company/RegionalPage';
import { getRegion } from '@/components/company/regions';

const TITLE = 'MAPL TECH Nigeria | Systems, Automation & Web Development for Nigerian Agencies';
const DESCRIPTION =
  'MAPL TECH Nigeria delivers systems, automation, AI workflows, web development, and custom internal tools for agencies in Lagos, Abuja, Port Harcourt, and across Nigeria. Canadian engineering standards, local expertise.';

export const metadata: Metadata = {
  title: TITLE,
  alternates: { canonical: 'https://mapltech.com/nigeria' },
  description: DESCRIPTION,
  keywords: 'MAPL TECH Nigeria, web development Nigeria, automation Nigeria, AI workflows Lagos, agency infrastructure Abuja, custom tools Nigeria',
  openGraph: {
    title: 'MAPL TECH Nigeria | Engineering Partner for Nigerian Agencies',
    description:
      'Canadian-headquartered engineering partner with a Nigeria branch. Systems, automation, and infrastructure for agencies in Lagos, Abuja, and beyond.',
    url: 'https://mapltech.com/nigeria',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Nigeria',
    description: 'Systems, automation, and infrastructure for Nigerian agencies.',
  },
};

export default function NigeriaPage() {
  return <RegionalPage region={getRegion('nigeria')} title={TITLE} description={DESCRIPTION} />;
}
