import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Explore MAPL TECH\'s portfolio of systems, automation, and infrastructure projects. Web development, AI workflows, and custom internal tools delivered for agency clients.',
  openGraph: {
    title: 'Our Work | MAPL TECH',
    description:
      'Portfolio of systems, automation, and web development projects for agencies.',
  },
};

export default function OurWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
