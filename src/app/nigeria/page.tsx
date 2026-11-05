import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import RegionalPage from '@/components/company/RegionalPage';
import { getRegion } from '@/components/company/regions';

const TITLE = 'MAPL TECH Nigeria | Web, Automation & Cloud for Agencies';
const DESCRIPTION =
  'MAPL TECH Nigeria builds websites, automation, AI workflows and internal tools for agencies in Lagos, Abuja and Port Harcourt, in West Africa Time.';

export const metadata: Metadata = {
  // The title already carries the brand, so it bypasses the root template's "| MAPL TECH" suffix.
  title: { absolute: TITLE },
  alternates: { canonical: 'https://mapltech.com/nigeria' },
  description: DESCRIPTION,
  keywords: 'MAPL TECH Nigeria, web development Nigeria, automation Nigeria, AI workflows Lagos, agency infrastructure Abuja, custom tools Nigeria',
  openGraph: {
    images: [OG_IMAGE],
    title: 'MAPL TECH Nigeria | Engineering Partner for Nigerian Agencies',
    description:
      'An engineering team headquartered in Toronto, with an office in Lagos. We work with agencies in Lagos, Abuja and beyond on websites, automation, internal tools and cloud systems.',
    url: 'https://mapltech.com/nigeria',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Nigeria',
    description: 'Websites, automation, internal tools and cloud systems, built with Nigerian agencies.',
  },
};

export default function NigeriaPage() {
  return <RegionalPage region={getRegion('nigeria')} title={TITLE} description={DESCRIPTION} />;
}
