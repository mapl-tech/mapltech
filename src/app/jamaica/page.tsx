import type { Metadata } from 'next';
import RegionalPage from '@/components/company/RegionalPage';
import { getRegion } from '@/components/company/regions';

const TITLE = 'MAPL TECH Jamaica | Systems, Automation & Web Development for Jamaican Agencies';
const DESCRIPTION =
  'MAPL TECH Jamaica builds websites, automation, AI workflows and internal tools for agencies in Kingston and Montego Bay, within an hour of Toronto all year.';

export const metadata: Metadata = {
  // The title already carries the brand, so it bypasses the root template's "| MAPL TECH" suffix.
  title: { absolute: TITLE },
  alternates: { canonical: 'https://mapltech.com/jamaica' },
  description: DESCRIPTION,
  keywords: 'MAPL TECH Jamaica, web development Jamaica, automation Jamaica, AI workflows Kingston, agency infrastructure Caribbean, custom tools Jamaica',
  openGraph: {
    title: 'MAPL TECH Jamaica | Engineering Partner for Jamaican Agencies',
    description:
      'Canadian-headquartered engineering partner with a Jamaica branch. Systems, automation, and infrastructure for Caribbean agencies.',
    url: 'https://mapltech.com/jamaica',
    type: 'website',
    locale: 'en_JM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Jamaica',
    description: 'Systems, automation, and infrastructure for Jamaican agencies.',
  },
};

export default function JamaicaPage() {
  return <RegionalPage region={getRegion('jamaica')} title={TITLE} description={DESCRIPTION} />;
}
