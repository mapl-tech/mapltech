import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/config/routes';
import { aboutPage, breadcrumb, graph, howTo, orgId, personRef } from '@/lib/schema';
import Close from '@/components/company/Close';
import { FoundersStory } from '@/components/company/Founders';
import Offices from '@/components/company/Offices';
import PageHero from '@/components/company/PageHero';
import Process from '@/components/company/Process';
import ShippedWork from '@/components/company/ShippedWork';
import { ABOUT, CALL_CTA, FOUNDERS, PRICE_CTA, TRUST_LINE } from '@/components/company/content';

const URL = 'https://mapltech.com/about-us';

export const metadata: Metadata = {
  title: ABOUT.title,
  description: ABOUT.description,
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'About MAPL TECH',
    description: ABOUT.description,
  },
  twitter: { card: 'summary_large_image', title: 'About MAPL TECH', description: ABOUT.description },
};

/*
 * /about-us, flagship redesign (Nov 2026). The company story told founder
 * first: the claim (the team behind your agency's name) -> why it exists, in
 * the founders' voice -> how it works behind your brand, with the client's
 * words as proof -> the three offices against your working day (the page's
 * one interaction) -> the ask.
 *
 * Structured data: AboutPage (mainEntity: the Organization from the root
 * layout) + BreadcrumbList + the two founders + HowTo, from the same arrays
 * the page renders. The founders here are compact Person nodes (name, title,
 * photo, LinkedIn) because the page shows those, not the full bios; the full
 * Person nodes live on /team, where the bios are on screen.
 */
const aboutGraph = graph([
  aboutPage({ name: ABOUT.title, description: ABOUT.description }),
  breadcrumb([{ name: ABOUT.title, path: '/about-us' }]),
  ...FOUNDERS.map((founder) => ({
    ...personRef(founder),
    image: absoluteUrl(founder.image),
    sameAs: [founder.linkedin],
    worksFor: orgId(),
  })),
  howTo(
    ABOUT.howWeWork.stages.map((stage) => ({ name: stage.name, text: stage.text, url: `/about-us#${stage.id}` })),
    { name: ABOUT.howWeWork.title.replace(/\.$/, ''), description: ABOUT.howWeWork.lede, path: '/about-us' },
  ),
]);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutGraph} />

      <PageHero
        eyebrow={ABOUT.hero.eyebrow}
        titleLines={ABOUT.hero.titleLines}
        lede={ABOUT.hero.lede}
        primary={{ ...PRICE_CTA, placement: 'about_hero_primary' }}
        secondary={{ ...CALL_CTA, placement: 'about_hero_call' }}
        trust={TRUST_LINE}
        facts={ABOUT.facts}
      />

      <FoundersStory />

      <Process />

      <ShippedWork title={ABOUT.work.title} lede={ABOUT.work.lede} placement="about" />

      <Offices />

      <Close id="close-title" title={ABOUT.close.title} lede={ABOUT.close.lede} placement="about" />
    </>
  );
}
