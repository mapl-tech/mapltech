import Link from 'next/link';
import { Faq } from '@/components/flagship/Acts';
import CloseBand from '@/components/flagship/CloseBand';
import { CLIENTS_LINE, HERO_REASSURE } from '@/components/flagship/content';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import HeroActions from './HeroActions';
import IndexRows from './IndexRows';
import Steps from './Steps';
import { keepNumberWords, keepTogether, withLastWord } from './keepTogether';
import { INDEX_FAQ, INDEX_STEPS, PARTNERSHIPS_HREF, PARTNERSHIP_FROM } from './serviceContent';
import styles from './ServicesIndex.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * /services (Nov 2026 simplify pass): one page, three ideas.
 *
 *   what we build (PageHeader) → the four services, one row and one link
 *   each, with one real project and one of its results beside it, and a
 *   quiet way to start that service (real work trailing the cursor on
 *   desktop) → how it works, on paper, in the homepage's four steps → the
 *   white-label questions, answered as on the homepage → the crimson close.
 *
 * The homepage's reassurance (a fixed quote after one call, an NDA first)
 * sits under the hero's buttons and the close's, the approved client quote
 * under the hero's, and the close names the clients instead of repeating it.
 * Server Component; the index preview is the only client island. Copy is
 * sourced in serviceContent.ts.
 */
export default function ServicesIndex() {
  return (
    <>
      <PageHeader
        id="services-title"
        label="Services"
        title={
          <>
            What we build <em>for agencies.</em>
          </>
        }
        lede={
          <p>
            Websites, automation, custom tools and cloud hosting, built alongside your team and under your brand. Every
            price is public.
          </p>
        }
        actions={
          <HeroActions page="services" secondary={{ label: PRICING_LABEL, href: PRICING_HREF }} note={HERO_REASSURE} />
        }
        proof
      />

      <section className={styles.index} aria-labelledby="lines-title">
        <div className={styles.indexInner}>
          <h2 id="lines-title" className={styles.indexLabel}>
            Our four services
          </h2>
          <IndexRows labelId="lines-title" />
          <div className={styles.pointer}>
            <p className={styles.pointerText}>
              {keepTogether(`Need more than one service? A monthly partnership covers two or more, from ${PARTNERSHIP_FROM}.`)}
            </p>
            {/* The partnerships row of the price list (it opens on arrival). */}
            <Link href={PARTNERSHIPS_HREF} className={styles.textLink} data-cta-placement="services_partner_pricing">
              {/* One flex item, so a wrapped label keeps the arrow after its last word. */}
              <span>
                {withLastWord(
                  'Compare monthly partnerships',
                  <span aria-hidden="true" className={styles.arrow}>
                    <Arrow />
                  </span>,
                )}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.how} aria-labelledby="how-title">
        <div className={styles.howInner}>
          <header className={styles.head}>
            <p className={styles.label}>How it works</p>
            <h2 id="how-title" className={styles.title}>
              Four steps, from first message to launch.
            </h2>
          </header>
          <Steps steps={INDEX_STEPS} tone="paper" placement="services_how" />
        </div>
      </section>

      <Faq items={INDEX_FAQ} />

      <CloseBand
        id="services-close-title"
        title="Not sure which service fits?"
        lede="Tell us about the project. We will help you choose the right service and agree the scope with you."
        note={keepNumberWords(HERO_REASSURE)}
        placement="services_close"
        proofLine={CLIENTS_LINE}
      />
    </>
  );
}
