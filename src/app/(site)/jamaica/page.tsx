import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import { LOWEST_PRICE } from '@/components/flagship/content';
import RegionalPage from '@/components/company/RegionalPage';
import { getRegion } from '@/components/company/regions';
import { formatMoney } from '@/lib/estimate';

const TITLE = 'MAPL TECH Jamaica | Websites & Booking Systems, Kingston';
// The price floor from `pricing` (LOWEST_PRICE), so the snippet never disagrees with the tables.
const DESCRIPTION = `Websites, booking systems, automation and cloud for agencies, tourism and service businesses in Kingston, Montego Bay and across Jamaica. From ${formatMoney(LOWEST_PRICE)} USD.`;

export const metadata: Metadata = {
  // The title already carries the brand, so it bypasses the root template's "| MAPL TECH" suffix.
  title: { absolute: TITLE },
  alternates: { canonical: 'https://mapltech.com/jamaica' },
  description: DESCRIPTION,
  keywords:
    'MAPL TECH Jamaica, web development Jamaica, website design Kingston, booking website Jamaica, tourism website Montego Bay, automation Jamaica, custom software Jamaica',
  openGraph: {
    images: [OG_IMAGE],
    title: 'MAPL TECH Jamaica | Websites and booking systems',
    description:
      'Websites, booking systems, automation and cloud for agencies, tourism and service businesses in Kingston and Montego Bay, from the team that runs MAPL Tours.',
    url: 'https://mapltech.com/jamaica',
    type: 'website',
    locale: 'en_JM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Jamaica',
    description: 'Websites and booking systems built for Jamaica, from the team that runs MAPL Tours.',
  },
};

export default function JamaicaPage() {
  return <RegionalPage region={getRegion('jamaica')} title={TITLE} description={DESCRIPTION} />;
}
