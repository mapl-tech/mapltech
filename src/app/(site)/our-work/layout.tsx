import type { Metadata } from 'next';
import { WORK_PAGE } from '@/components/work/catalog';

const url = 'https://mapltech.com/our-work';
// A real capture of the first project on view (LRO Staffing), never a mockup.
const image = { url: '/images/cases/lro-desktop.jpg', width: 1800, height: 1125, alt: 'The LRO Staffing website, built by MAPL TECH.' };

// /our-work metadata. Case pages (/our-work/[slug]) set their own title,
// description, canonical and Open Graph, so nothing here leaks into them.
export const metadata: Metadata = {
  title: WORK_PAGE.title,
  description: WORK_PAGE.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    url,
    siteName: 'MAPL TECH',
    title: `${WORK_PAGE.title} | MAPL TECH`,
    description: WORK_PAGE.description,
    images: [image],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${WORK_PAGE.title} | MAPL TECH`,
    description: WORK_PAGE.description,
    images: [image.url],
  },
};

export default function OurWorkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
