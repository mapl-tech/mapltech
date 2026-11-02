import type { Metadata } from 'next';
import { REFERRAL_DESCRIPTION, REFERRAL_TITLE, REFERRAL_URL } from '@/components/pricing/referralContent';

const SOCIAL_TITLE = `${REFERRAL_TITLE} | MAPL TECH`;
// The site's Open Graph image (the root layout's), with its own alt text.
const OG_IMAGE = '/images/og-flagship.jpg';

// Root layout metadata is shallow-merged, so Open Graph and Twitter are set in
// full here; otherwise they would inherit the homepage's URL and copy.
export const metadata: Metadata = {
  title: REFERRAL_TITLE,
  description: REFERRAL_DESCRIPTION,
  alternates: { canonical: REFERRAL_URL },
  openGraph: {
    type: 'website',
    url: REFERRAL_URL,
    siteName: 'MAPL TECH',
    locale: 'en_CA',
    title: SOCIAL_TITLE,
    description: REFERRAL_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'MAPL TECH: The engineering backbone behind agencies that refuse to cut corners. A spine of crimson, graphite and chrome rods beside the headline.' }],
  },
  twitter: { card: 'summary_large_image', title: SOCIAL_TITLE, description: REFERRAL_DESCRIPTION, images: [OG_IMAGE] },
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
