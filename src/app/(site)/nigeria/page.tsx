import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import { LOWEST_PRICE } from '@/components/flagship/content';
import RegionalPage from '@/components/company/RegionalPage';
import { getRegion } from '@/components/company/regions';
import { formatMoney } from '@/lib/estimate';

const TITLE = 'MAPL TECH Nigeria | Web Development & Automation, Lagos';
// The price floor from `pricing` (LOWEST_PRICE), so the snippet never disagrees with the tables.
const DESCRIPTION = `Websites, automation, internal tools and cloud systems for agencies and businesses in Lagos, Abuja and across Nigeria. Light on mobile data, from ${formatMoney(LOWEST_PRICE)} USD.`;

export const metadata: Metadata = {
  // The title already carries the brand, so it bypasses the root template's "| MAPL TECH" suffix.
  title: { absolute: TITLE },
  alternates: { canonical: 'https://mapltech.com/nigeria' },
  description: DESCRIPTION,
  keywords:
    'MAPL TECH Nigeria, web development Nigeria, web development Lagos, website developer Abuja, automation Nigeria, Paystack integration, NDPA, custom software Nigeria',
  openGraph: {
    images: [OG_IMAGE],
    title: 'MAPL TECH Nigeria | Websites and software for Nigeria',
    description:
      'Websites, automation, internal tools and cloud systems for agencies and businesses in Lagos, Abuja and across Nigeria, from our Lagos office.',
    url: 'https://mapltech.com/nigeria',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Nigeria',
    description: 'Websites and software built for Nigeria, for agencies and businesses in Lagos, Abuja and beyond.',
  },
};

export default function NigeriaPage() {
  return <RegionalPage region={getRegion('nigeria')} title={TITLE} description={DESCRIPTION} />;
}
