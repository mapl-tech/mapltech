import type { Metadata } from 'next';
import Script from 'next/script';
import { Overpass } from 'next/font/google';
import { siteConfig } from '@/config/site';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import CursorGlow from '@/components/ui/CursorGlow';
import '@/styles/tailwind.css';
import '@/styles/globals.scss';

const overpass = Overpass({
  subsets: ['latin'],
  variable: '--font-overpass',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    'MAPL TECH is a systems, automation, cloud, and infrastructure partner for digital agencies. We build scalable websites, internal tools, AI-driven workflows, and cloud infrastructure that support complex client projects beyond design and marketing.',
  metadataBase: new URL(siteConfig.url),
  keywords: [
    'MAPL TECH',
    'MAPL TECH Inc',
    'mapltech',
    'digital agency infrastructure partner',
    'systems partner for digital agencies',
    'automation partner for agencies',
    'technical partner for marketing agencies',
    'backend development for agencies',
    'agency systems engineering',
    'scalable web infrastructure',
    'enterprise WordPress development',
    'headless WordPress development',
    'custom CMS development',
    'high-performance WordPress systems',
    'custom internal tools development',
    'internal dashboards for agencies',
    'workflow automation for agencies',
    'business process automation',
    'AI workflow development',
    'AI-driven automation',
    'AI systems integration',
    'AI agents for business workflows',
    'custom AI tools for agencies',
    'cloud engineering for agencies',
    'cloud infrastructure management',
    'AWS GCP Azure for agencies',
    'CI/CD pipeline engineering',
    'Infrastructure as Code',
    'DevOps for agencies',
    'cloud migration services',
    'full-stack development services',
    'React-based internal tools',
    'technical consulting for agencies',
    'fractional CTO services',
    'white-label development partner',
    'agency backend support',
    'web development',
    'internal tools',
    'AI workflows',
    'Canada',
    'Nigeria',
    'Jamaica',
  ],
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Systems, Automation & Infrastructure Partner for Digital Agencies`,
    description:
      'MAPL TECH is a systems, automation, cloud, and infrastructure partner for digital agencies. We build scalable websites, internal tools, AI-driven workflows, and cloud infrastructure that support complex client projects beyond design and marketing.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MAPL TECH - Systems, Automation & Infrastructure for Agencies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mapltech',
    creator: '@mapltech',
    title: `${siteConfig.name} | Systems, Automation & Infrastructure Partner for Digital Agencies`,
    description:
      'MAPL TECH is a systems, automation, cloud, and infrastructure partner for digital agencies. We build scalable websites, internal tools, AI-driven workflows, and cloud infrastructure.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-video-preview': -1,
    'max-image-preview': 'large' as const,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  other: {
    'msapplication-TileImage': '/mstile-270x270.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: 'MAPL TECH',
      alternateName: 'MAPL TECH Inc.',
      url: siteConfig.url,
      email: siteConfig.email,
      sameAs: [
        siteConfig.social.instagram,
        siteConfig.social.x,
        siteConfig.social.facebook,
        siteConfig.social.linkedin,
        siteConfig.social.tiktok,
      ],
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/mapl-tech-logo.svg`,
        caption: 'MAPL TECH',
      },
      description:
        'MAPL TECH is a systems, automation, cloud, and infrastructure partner for digital agencies. We design and build scalable websites, custom internal tools, AI-driven workflows, and cloud infrastructure that support complex client projects beyond design and marketing.',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'ON',
        addressCountry: 'Canada',
        addressLocality: 'Toronto',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: 'MAPL TECH',
      publisher: { '@id': `${siteConfig.url}/#organization` },
      inLanguage: 'en-CA',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/?s={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={overpass.variable}>
      <head>
        {/* Preconnect to third-party origins for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://static.hotjar.com" />
        <link rel="dns-prefetch" href="https://static.hotjar.com" />

        {/* Google Analytics - lazyOnload to prioritize page content */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F2XZRRNH7S"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F2XZRRNH7S');
          `}
        </Script>

        {/* Hotjar - lazyOnload to prioritize page content */}
        <Script id="hotjar" strategy="lazyOnload">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6538513,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
