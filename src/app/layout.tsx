import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import CursorGlow from '@/components/ui/CursorGlow';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    'systems',
    'automation',
    'infrastructure',
    'web development',
    'internal tools',
    'AI workflows',
    'agency partner',
    'MAPL TECH',
    'Canada',
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <SmoothScroll />
        <CursorGlow />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
