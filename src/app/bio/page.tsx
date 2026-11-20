import type { Metadata } from 'next';
import Image from 'next/image';
import Arrow from '@/components/ui/Arrow';
import Steps from '@/components/services/Steps';
import TrustList from '@/components/flagship/TrustList';
import QuoteLine from '@/components/flagship/QuoteLine';
import { siteConfig } from '@/config/site';
import VslPlayer from '@/components/bio/VslPlayer';
import CallForm from '@/components/bio/CallForm';
import BookButton from '@/components/bio/BookButton';
import StickyBar from '@/components/bio/StickyBar';
import ClientParade from '@/components/bio/ClientParade';
import BioFaq from '@/components/bio/BioFaq';
import { BIO_ORIGIN, CASES, CLIENTS, CLOSE, HERO, LEGAL, QUOTE, RATING, STEPS, VSL } from '@/components/bio/content';
import styles from '@/components/bio/Bio.module.scss';

/**
 * bio.mapltech.com (next.config.ts serves this page at the subdomain's root):
 * the video sales page for MAPL TECH's social bios, after
 * scalingprocess.com/vsl. One ask throughout ("Book my call", the call
 * request in CallForm), no site navigation, the founder's video first and
 * the client logos under it, then how it works, the work, a client's words,
 * the questions people ask and the close. Not indexed: it is a funnel page,
 * and mapltech.com is the site.
 * Layout, copy and psychology: Sentinel's brief (scratchpad SPEC.md, Nov 19, 2026).
 */

const TITLE = 'MAPL TECH | One fixed price. An agreed launch date.';
const DESCRIPTION =
  'Websites, booking systems and AI tools for one fixed price and an agreed launch date. If we miss the date, you don’t pay the final payment. Watch the 28-second video.';
const SHARE_IMAGE = { url: VSL.poster, width: 1920, height: 1080, alt: 'Leshan Patterson, co-founder of MAPL TECH' };

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: `${BIO_ORIGIN}/` },
  openGraph: {
    type: 'website',
    url: `${BIO_ORIGIN}/`,
    siteName: siteConfig.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mapltech',
    title: TITLE,
    description: DESCRIPTION,
    images: [VSL.poster],
  },
};

function Stars() {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" width="14" height="14" focusable="false">
          <path d="M8 1.5l1.94 4.13 4.53.55-3.34 3.1.87 4.47L8 11.53l-4 2.22.87-4.47-3.34-3.1 4.53-.55z" />
        </svg>
      ))}
    </span>
  );
}

export default function BioPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to main content
      </a>

      <header className={styles.bar}>
        <a href={LEGAL.home} className={styles.brand}>
          <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={132} height={29} preload />
        </a>
      </header>

      <main id="main" tabIndex={-1} className={styles.main}>
        {/* ---- 1. The video, the promise and the one ask. */}
        <section className={styles.hero} aria-labelledby="bio-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <a className={styles.rating} href={RATING.href} target="_blank" rel="noopener noreferrer" data-cta-placement="bio_rating">
                <Stars />
                {RATING.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <h1 id="bio-title" className={styles.title}>
                {HERO.titleLines.map((line) => (
                  <span key={line} className={styles.titleLine}>
                    {line}{' '}
                  </span>
                ))}
              </h1>
              <p className={styles.lede}>{HERO.lede}</p>
            </div>

            <div className={styles.heroMedia}>
              <VslPlayer />
              {/* Under the video it transcribes. */}
              <details className={styles.transcript}>
                <summary>
                  Read what Leshan says <span className={styles.transcriptMeta}>(transcript)</span>
                </summary>
                <div className={styles.transcriptBody}>
                  {VSL.transcript.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </details>
            </div>

            <div className={styles.heroAsk} data-bio-hero-cta="">
              <BookButton placement="bio_hero" className={styles.primary} arrowClassName={styles.arrow} />
              <p className={styles.effort}>{HERO.effort}</p>
              <TrustList items={HERO.trust} className={styles.trust} />
              {/* A client's own words beside the first ask (Alita Fabiano, LRO Staffing). */}
              <QuoteLine className={styles.heroQuote} />
            </div>
          </div>

          {/* The clients the homepage shows, straight after the first ask. */}
          <ClientParade label={CLIENTS.label} logos={CLIENTS.logos} />
        </section>

        {/* ---- 2. How it works. */}
        <section className={styles.section} aria-labelledby="bio-how">
          <div className={styles.shell}>
            <h2 id="bio-how" className={styles.h2}>
              How it works
            </h2>
            <div className={styles.steps}>
              <Steps steps={STEPS} />
            </div>
          </div>
        </section>

        {/* ---- 3. The work, then the ask again beside it. */}
        <section className={`${styles.section} ${styles.workSection}`} aria-labelledby="bio-work">
          <div className={styles.shell}>
            <h2 id="bio-work" className={styles.h2}>
              Work we’ve launched
            </h2>
            <p className={styles.sectionLede}>Live projects you can visit, including the travel business from the video.</p>
            <ul className={styles.cases} role="list">
              {CASES.map((item) => (
                <li key={item.slug} className={styles.case}>
                  <div className={styles.caseMedia}>
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1200px) 560px, (min-width: 768px) 46vw, calc(100vw - 32px)"
                      className={styles.caseImage}
                    />
                  </div>
                  <div className={styles.caseBody}>
                    <p className={styles.caseKind}>{item.kind}</p>
                    <h3 className={styles.caseTitle}>
                      <a href={item.href} className={styles.caseLink} data-cta-placement={`bio_case_${item.slug}`}>
                        {item.client}
                      </a>
                    </h3>
                    <p className={styles.caseSummary}>{item.summary}</p>
                    {item.result ? (
                      <p className={styles.caseResult}>
                        {item.value ? <strong className={styles.caseValue}>{item.value}</strong> : null}
                        <span>{item.result}</span>
                      </p>
                    ) : null}
                    <span className={styles.caseMore} aria-hidden="true">
                      Read the case study <Arrow />
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.midAsk}>
              <BookButton placement="bio_work" className={styles.primary} arrowClassName={styles.arrow} />
              <p className={styles.midNote}>Fixed quote after one 20&#8209;minute call. If we miss the launch date, you don’t pay the final payment.</p>
            </div>
          </div>
        </section>

        {/* ---- 4. A client, in her words. */}
        {QUOTE ? (
          <section className={styles.quoteSection} aria-label="What a client says">
            <figure className={styles.quote}>
              <svg className={styles.quoteMark} viewBox="0 0 48 36" width="48" height="36" aria-hidden="true" focusable="false">
                <path d="M0 36V22.4C0 9.6 6.2 2.1 18.6 0l2 4.6C13.8 6.4 10.4 10.4 10.2 16.6H20V36H0zm28 0V22.4C28 9.6 34.2 2.1 46.6 0l2 4.6c-6.8 1.8-10.2 5.8-10.4 12H48V36H28z" />
              </svg>
              <blockquote className={styles.quoteText}>
                <p>{QUOTE.text}</p>
              </blockquote>
              <figcaption className={styles.quoteBy}>
                {QUOTE.image ? (
                  <Image src={QUOTE.image} alt="" width={56} height={56} className={styles.quotePhoto} />
                ) : null}
                <span>
                  <span className={styles.quoteName}>{QUOTE.name}</span>
                  <span className={styles.quoteRole}>{QUOTE.role}</span>
                </span>
              </figcaption>
            </figure>
          </section>
        ) : null}

        {/* ---- 5. The questions people ask before they book, with the ask beside them. */}
        <section className={styles.section} aria-labelledby="bio-faq">
          <div className={styles.shell}>
            <BioFaq />
          </div>
        </section>

        {/* ---- 6. The close: the hesitation named, the ask, the rating beside it. */}
        <section className={styles.close} aria-labelledby="bio-close" data-bio-close="">
          <div className={styles.closeInner}>
            <h2 id="bio-close" className={styles.closeTitle}>
              {CLOSE.title}
            </h2>
            <p className={styles.closeLede}>{CLOSE.lede}</p>
            <BookButton placement="bio_close" className={styles.closeButton} arrowClassName={styles.arrow} />
            <TrustList items={['A reply within 24 hours']} tone="band" rating className={styles.closeTrust} />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCompany}>
            {LEGAL.company} <span className={styles.footerOffices}>{LEGAL.offices}</span>
          </p>
          <ul className={styles.footerLinks} role="list">
            <li>
              <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
            </li>
            <li>
              <a href={LEGAL.home}>mapltech.com</a>
            </li>
            <li>
              <a href={LEGAL.privacy}>Privacy</a>
            </li>
            <li>
              <a href={LEGAL.terms}>Terms</a>
            </li>
          </ul>
          <p className={styles.copyright}>© {year} {LEGAL.company}</p>
        </div>
      </footer>

      <StickyBar />
      <CallForm />
    </>
  );
}
