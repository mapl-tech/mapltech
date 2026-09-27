import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { siteConfig } from '@/config/site';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import CursorGlow from '@/components/ui/CursorGlow';
import MobileActionBar from '@/components/ui/MobileActionBar';
import JsonLd from '@/components/seo/JsonLd';
import { siteGraph } from '@/lib/schema';
import '@/styles/tailwind.css';
import '@/styles/globals.scss';

// Body, UI, buttons. Variable font: full weight axis in one file.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// Display serif for headings and pull quotes. Ships a single 400 face (+ italic);
// globals.scss disables weight synthesis so it never renders as faux bold.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

// Metadata: eyebrows, key facts, prices, clocks, code.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
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
    'AI adoption for Canadian businesses',
    'Canada AI strategy partner',
    'AI for All strategy',
    'AI adoption partner Canada',
    'SME AI adoption Canada',
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

// viewportFit: 'cover' lets the mobile action bar and bottom sheets pad with
// env(safe-area-inset-bottom); themeColor matches the warm ground.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
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
        {/* Structured data: one @graph (Organization + WebSite) from src/lib/schema.ts; pages add their own nodes via pageGraph(). */}
        <JsonLd data={siteGraph()} />
      </head>
      <body>
        <a href="#main" className="skip-to-content">
          Skip to main content
        </a>
        {/* Lenis substrate: desktop, fine pointer, motion allowed. Renders no HTML. */}
        <SmoothScroll />
        {/*
          Cursor pill. CursorGlow is a 'use client' island that renders nothing on
          the server, so it adds no HTML here. `next/dynamic({ ssr: false })` is not
          permitted inside a Server Component (this layout), so the ssr:false
          boundary must live inside src/components/ui/CursorGlow.tsx itself
          (export default dynamic(() => import('./CursorPill'), { ssr: false })).
        */}
        <CursorGlow />
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        {/* Mobile sticky action bar (md:hidden): estimate + call, shown once the hero CTA scrolls out. */}
        <MobileActionBar />
      </body>
    </html>
  );
}
