import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referral Program',
  description:
    'Refer agencies to MAPL TECH and earn rewards. Our referral program thanks you for connecting us with agencies that need systems, automation, and infrastructure support.',
  openGraph: {
    title: 'Referral Program | MAPL TECH',
    description:
      'Refer agencies to MAPL TECH and earn rewards for successful introductions.',
  },
};

export default function ReferralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
