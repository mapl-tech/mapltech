import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/config/routes';
import { aboutPage, breadcrumb, graph, orgId, personRef } from '@/lib/schema';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import FactsBand from '@/components/company/FactsBand';
import { FoundersSpread } from '@/components/company/Founders';
import HeroActions from '@/components/company/HeroActions';
import Offices from '@/components/company/Offices';
import Story from '@/components/company/Story';
import { ABOUT, FOUNDERS } from '@/components/company/content';

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
 * /about-us, Nov 2026 simplify pass. The live site's purpose as the first
 * screen (the engineering backbone behind agencies that refuse to cut
 * corners), the answer-first facts, then: why MAPL TECH exists, in the
 * founders' voice -> the two founders (paper) -> the three offices -> the
 * crimson close. How the work runs is told once, on the homepage.
 *
 * Structured data: AboutPage (mainEntity: the Organization from the root
 * layout) + BreadcrumbList + the two founders, from the same arrays the page
 * renders. The founders here are compact Person nodes (name, title, photo,
 * LinkedIn) because the page shows those, not the full bios; the full Person
 * nodes live on /team, where the bios are on screen.
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
]);

export default function AboutPage() {
  const { hero } = ABOUT;
  return (
    <>
      <JsonLd data={aboutGraph} />

      <PageHeader
        size="l"
        label={hero.label}
        title={hero.title.map((run) => (run.accent ? <em key={run.text}>{run.text}</em> : run.text))}
        lede={<p>{hero.lede}</p>}
        actions={
          <HeroActions
            primary={{ label: PROJECT_LABEL, href: PROJECT_HREF, placement: 'about_hero_primary' }}
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: 'about_hero_secondary' }}
          />
        }
      />

      <FactsBand facts={ABOUT.facts} label="MAPL TECH at a glance" />

      <Story />

      <FoundersSpread />

      <Offices />

      <CloseBand title={ABOUT.close.title} placement="about_close" />
    </>
  );
}
