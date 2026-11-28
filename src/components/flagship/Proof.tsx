import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import { caseFor } from './caseFor';
import { PROOF_SECTION, PROOF_WALL } from './content';
import SectionAsk from './SectionAsk';
import WallClocks from './WallClocks';
import WallSpot from './WallSpot';
import styles from './Proof.module.scss';

/**
 * A figure as printed ("$3,500", "~50%", "200+"): the digits in the page's
 * ink, the signs in crimson. A sign before the digits ("$", "~") is set
 * smaller and raised, as a typeset price is, so the digits lead; one after
 * them ("%", "+") stays full size. "~" is shown, and read as "about".
 */
function Figure({ value }: { value: string }) {
  return value
    .split(/([^\d.,]+)/)
    .filter(Boolean)
    .map((part, i) => {
      if (/\d/.test(part)) return <Fragment key={i}>{part}</Fragment>;
      if (i > 0) {
        return (
          <span key={i} className={styles.sign}>
            {part}
          </span>
        );
      }
      return part === '~' ? (
        <Fragment key={i}>
          <span className={`${styles.sign} ${styles.lead} ${styles.approx}`} aria-hidden="true">
            ~
          </span>
          <span className="visually-hidden">about </span>
        </Fragment>
      ) : (
        <span key={i} className={`${styles.sign} ${styles.lead}`}>
          {part}
        </span>
      );
    });
}

/**
 * A tile's link, at the tile's foot: its words name the destination. With
 * `cover`, it also covers its tile (::after), and the tile answers a mouse as
 * one link (the light, the lift); that is for the figure tiles only. A tile
 * that quotes someone keeps the quotation selectable, so there only the words
 * of the link are the link. `short` is shown instead of `label` where the
 * tile is half a phone wide (CSS); the hidden one is not part of the name,
 * and analytics reads `label` from data-cta-label rather than both from the
 * link's text.
 */
function TileLink({
  href,
  label,
  short,
  context,
  placement,
  cover = false,
}: {
  href: string;
  label: string;
  short?: string;
  /** Said to screen readers after the label (": LRO Staffing"), as the work cards do. */
  context?: string;
  placement: string;
  cover?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cover ? `${styles.tileLink} ${styles.cover}` : styles.tileLink}
      data-cta-placement={placement}
      data-cta-label={short ? label : undefined}
    >
      <span>
        {short ? (
          <>
            <span className={styles.long}>{label}</span>
            <span className={styles.short}>{short}</span>
          </>
        ) : (
          label
        )}
        {context ? <span className="visually-hidden">: {context}</span> : null}
      </span>
      <span aria-hidden="true" className={styles.tileArrow}>
        <Arrow />
      </span>
    </Link>
  );
}

/**
 * Why agencies work with us: the proof wall (content.ts PROOF_WALL, Nov 28,
 * 2026). Six tiles, each one piece of proof in one shape: a small heading,
 * the proof, one caption, its link. It opens on a client's own sentence and
 * ends on the CHHA-NCR audit's verdict, so the last thing read before the ask
 * is third-party proof ("above what most agencies ship"): proof belongs beside
 * the decision it supports. From 1280px a twelve-column bento split 6 | 6 in
 * every row: the client's sentence as the lead tile (two rows tall, on the
 * work cards' crimson glow) beside the price and the projects, with the
 * offices' live hours under those two; then MAPL Tours' ChatGPT share over its
 * own site under the sentence, and the audit beside it, over the ask. 7 | 5
 * from 1024px (the hours across the width), six columns on tablets, two on
 * phones (the two figure tiles side by side). Then one ask.
 */
export default function Proof() {
  const { voice, price, team, hours, search, audit } = PROOF_WALL;
  const voiceCase = voice ? caseFor(voice.quote) : null;
  const auditCase = audit ? caseFor(audit.quote) : null;

  return (
    <section className={styles.proof} aria-labelledby="proof-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{PROOF_SECTION.label}</p>
          <h2 id="proof-title" className={styles.title}>
            {PROOF_SECTION.title}
          </h2>
          <p className={styles.lede}>{PROOF_SECTION.lede}</p>
        </header>

        <WallSpot className={styles.wall}>
          {voice ? (
            <li data-tile="" className={`${styles.tile} ${styles.voice}`}>
              <h3 className={styles.tileHeading}>{voice.heading}</h3>
              <figure className={styles.voiceFigure}>
                <svg className={styles.mark} viewBox="0 0 48 36" width="48" height="36" aria-hidden="true" focusable="false">
                  <path d="M0 36V22.4C0 9.6 6.2 2.1 18.6 0l2 4.6C13.8 6.4 10.4 10.4 10.2 16.6H20V36H0zm28 0V22.4C28 9.6 34.2 2.1 46.6 0l2 4.6c-6.8 1.8-10.2 5.8-10.4 12H48V36H28z" />
                </svg>
                {/* The crimson mark opens the quote, so the words carry no marks of their own. */}
                <blockquote className={styles.voiceQuote}>
                  <p>{voice.excerpt}</p>
                </blockquote>
                <figcaption className={styles.voiceBy}>
                  {voice.image ? (
                    <Image src={voice.image} alt="" width={56} height={56} className={styles.voiceAvatar} />
                  ) : null}
                  <span>
                    <span className={styles.voiceName}>{voice.name}</span>{' '}
                    <span className={styles.voiceDetail}>{voice.detail}</span>
                  </span>
                </figcaption>
              </figure>
              {voiceCase ? (
                <TileLink
                  href={voiceCase.href}
                  label="Read the case study"
                  context={voiceCase.client}
                  placement={`home_proof_case_${voiceCase.slug}`}
                />
              ) : null}
            </li>
          ) : null}

          {/* The figure tiles' headings hold their figures, so each reads whole in a
              list of headings ("Prices from $3,500"); they look as every tile does. */}
          <li data-tile="" className={`${styles.tile} ${styles.price}`}>
            <h3 className={styles.figureHeading}>
              <span className={styles.tileHeading}>{price.heading}</span>{' '}
              <span className={styles.figure}>
                <Figure value={price.figure} />
              </span>
            </h3>
            <p className={styles.caption}>{price.caption}</p>
            <TileLink href={price.link.href} label={price.link.label} short={price.link.short} placement="home_proof_pricing" cover />
          </li>

          <li data-tile="" className={`${styles.tile} ${styles.team}`}>
            <h3 className={styles.figureHeading}>
              <span className={styles.tileHeading}>{team.heading}</span>{' '}
              <span className={styles.figure}>
                <Figure value={team.figure} />
              </span>
            </h3>
            <p className={styles.caption}>{team.caption}</p>
            <TileLink href={team.link.href} label={team.link.label} short={team.link.short} placement="home_proof_team" cover />
          </li>

          <li data-tile="" className={`${styles.tile} ${styles.hours}`}>
            <h3 className={styles.tileHeading}>{hours.heading}</h3>
            <WallClocks cities={hours.cities} />
          </li>

          {search ? (
            <li data-tile="" className={`${styles.tile} ${styles.search}`}>
              <div className={styles.searchCopy}>
                <h3 className={styles.tileHeading}>{search.heading}</h3>
                <p className={styles.figure}>
                  <Figure value={search.figure} />
                </p>
                <p className={styles.caption}>{search.caption}</p>
                <TileLink href={search.link.href} label={search.link.label} context={search.link.context} placement="home_proof_case_mapl-tours" cover />
              </div>
              {search.shot ? (
                <div className={styles.shot} aria-hidden="true">
                  <div className={styles.chrome}>
                    <span className={styles.lights}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.url}>{search.shot.url}</span>
                  </div>
                  <Image
                    src={`/images/cases/${search.shot.desktop}.jpg`}
                    alt=""
                    width={1800}
                    height={1125}
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw"
                    className={styles.shotImage}
                  />
                </div>
              ) : null}
            </li>
          ) : null}
          {audit ? (
            <li data-tile="" className={`${styles.tile} ${styles.audit}`}>
              <h3 className={styles.tileHeading}>{audit.heading}</h3>
              <figure className={styles.auditFigure}>
                <p className={styles.seal}>
                  <span className="visually-hidden">WCAG </span>
                  {audit.figure}
                </p>
                <div className={styles.auditWords}>
                  {/* Its quotation marks are drawn in crimson (CSS), as the lead tile's mark is. */}
                  <blockquote className={styles.auditQuote}>
                    <p>{audit.excerpt}</p>
                  </blockquote>
                  <figcaption className={styles.auditBy}>{audit.by}</figcaption>
                </div>
              </figure>
              {auditCase ? (
                <TileLink href={audit.link.href} label={audit.link.label} context={audit.link.context} placement={`home_proof_case_${auditCase.slug}`} />
              ) : null}
            </li>
          ) : null}

        </WallSpot>

        {/* The page's second ask (the work cards end on the first), so the quieter one. */}
        <SectionAsk title={PROOF_SECTION.ask} placement="home_proof_ask" compact />
      </div>
    </section>
  );
}
