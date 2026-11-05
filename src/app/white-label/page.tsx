import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, howTo, pageGraph } from '@/lib/schema';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { Faq } from '@/components/flagship/Acts';
import { APPROACH, CLIENTS_LINE, TRUST_ITEMS } from '@/components/flagship/content';
import FactsBand from '@/components/company/FactsBand';
import HeroActions from '@/components/company/HeroActions';
import ed from '@/components/company/Company.module.scss';
import Steps from '@/components/services/Steps';
import { FAQ_ITEMS } from '@/components/home/data';
import { Fit, Roles, Voice } from '@/components/partnership/WhiteLabel';
import { WHITE_LABEL, WHITE_LABEL_PATH } from '@/components/partnership/content';

const URL = `https://mapltech.com${WHITE_LABEL_PATH}`;

export const metadata: Metadata = {
  title: WHITE_LABEL.title,
  description: WHITE_LABEL.description,
  alternates: { canonical: URL },
  keywords: [
    'white-label development partner',
    'white-label web development for agencies',
    'white-label automation for agencies',
    'outsourced development for agencies',
    'agency engineering partner',
  ],
  openGraph: {
    type: 'website',
    url: URL,
    title: `${WHITE_LABEL.title} | MAPL TECH`,
    description: WHITE_LABEL.description,
  },
  twitter: { card: 'summary_large_image', title: `${WHITE_LABEL.title} | MAPL TECH`, description: WHITE_LABEL.description },
};

/*
 * /white-label (Nov 5, 2026), for agency founders: how working together runs,
 * from the competitor analysis (each white-label competitor spells out its
 * mechanics; we had the promises scattered over the FAQ). The first screen
 * says what we are to the agency, under the ask and its checklist, with three
 * published figures beside it. Then: the four steps (the homepage's, so the
 * process reads the same everywhere) -> who does what (paper) -> when to bring
 * us in, an honest fit guide -> the approved client quote, in full -> the
 * white-label FAQ -> the crimson close. Every fact is already published
 * (src/components/partnership/content.ts lists the sources).
 *
 * Structured data: WebPage + BreadcrumbList, a HowTo for the four steps and
 * the FAQPage from the same questions the page renders.
 */
const graph = pageGraph({
  path: WHITE_LABEL_PATH,
  name: WHITE_LABEL.title,
  description: WHITE_LABEL.description,
  breadcrumbs: [{ name: 'How we work', path: WHITE_LABEL_PATH }],
  nodes: [
    howTo(
      APPROACH.steps.map((step) => ({ name: step.title, text: step.text })),
      { path: WHITE_LABEL_PATH, name: 'How a white-label project with MAPL TECH runs' },
    ),
    faqPage(FAQ_ITEMS, { path: WHITE_LABEL_PATH, name: 'Questions agencies ask' }),
  ],
});

export default function WhiteLabelPage() {
  const { hero, process } = WHITE_LABEL;
  return (
    <>
      <JsonLd data={graph} />

      <PageHeader
        size="l"
        label={hero.label}
        title={
          <>
            Part of your team. <em>Under your brand.</em>
          </>
        }
        lede={<p>{hero.lede}</p>}
        actions={
          <HeroActions
            primary={{ label: PROJECT_LABEL, href: PROJECT_HREF, placement: 'white_label_hero_primary' }}
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: 'white_label_hero_secondary' }}
          />
        }
        trust={TRUST_ITEMS}
        asideAlign="body"
        aside={<FactsBand facts={WHITE_LABEL.facts} label="Working with MAPL TECH" placement="aside" />}
      />

      <section className={`${ed.dark} ${ed.ruled}`} aria-labelledby="process-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>{process.label}</p>
            <h2 id="process-title" className={ed.title}>
              {process.title}
            </h2>
            <p className={ed.lede}>{process.lede}</p>
          </header>
          <Steps steps={APPROACH.steps} placement="white_label_how" />
        </div>
      </section>

      <Roles />

      <Fit />

      <Voice />

      <Faq items={FAQ_ITEMS} />

      <CloseBand
        id="white-label-close-title"
        title={WHITE_LABEL.close.title}
        lede={WHITE_LABEL.close.lede}
        trust={TRUST_ITEMS}
        proofLine={CLIENTS_LINE}
        placement="white_label_close"
      />
    </>
  );
}
