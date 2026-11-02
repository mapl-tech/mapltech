import Link from 'next/link';
import Image, { getImageProps } from 'next/image';
import { preload } from 'react-dom';
import DepthScene from './DepthScene';
import HeroEstimate from './HeroEstimate';
import LightField from './LightField';
import { HERO, HERO_PROOF, SECONDARY_CTA } from './content';
import styles from './Hero.module.scss';

/**
 * Act 1, Recognition. The promise on the left; on the right, the proof that
 * this is a software studio: a working price check in front of real work
 * (the LRO Staffing site in a browser, MAPL Tours on a phone), over a live
 * light field. The frames drift on scroll through DepthScene's `--p`, the
 * pointer drives only the light's bloom, and the card stays still so it reads
 * and clicks cleanly.
 *
 * Reading order is copy, price check, then the next steps (the work and one
 * attributed client line), which desktop places under the copy, beside the card.
 *
 * The frames are desktop-only art: below 1024px their <source> does not match
 * and the <img> resolves to an inline blank, so phones download nothing. The
 * H1 is in the first paint, never faded in, so it can be the LCP element.
 */

const DESKTOP = '(min-width: 1024px)';
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function desktopSource(frame: { src: string; width: number; height: number }, sizes: string) {
  const { props } = getImageProps({ src: frame.src, width: frame.width, height: frame.height, alt: '', sizes });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}

export default function Hero() {
  const { browser, phone } = HERO.frames;
  const browserSource = desktopSource(browser, `${DESKTOP} 40vw, 1px`);
  const phoneSource = desktopSource(phone, `${DESKTOP} 200px, 1px`);

  // The browser frame can be the largest paint on desktop: request it with the
  // document head, under the same media query, so phones never fetch it.
  preload(browserSource.src, {
    as: 'image',
    imageSrcSet: browserSource.srcSet,
    imageSizes: browserSource.sizes,
    media: DESKTOP,
    fetchPriority: 'high',
  });

  return (
    <DepthScene as="section" className={styles.hero} aria-labelledby="home-h1">
      <LightField className={styles.light} />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 id="home-h1" className={styles.title}>
            {HERO.titleLines.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h1>
          <p className={styles.lede}>{HERO.lede}</p>
        </div>

        <div className={styles.stage}>
          <div className={styles.frames} aria-hidden="true">
            <div className={styles.browser}>
              <div className={styles.chrome}>
                <span className={styles.lights}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.url}>{browser.url}</span>
              </div>
              <picture>
                <source media={DESKTOP} srcSet={browserSource.srcSet} sizes={browserSource.sizes} />
                <img
                  src={BLANK}
                  alt=""
                  width={browser.width}
                  height={browser.height}
                  className={styles.shot}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
            <div className={styles.phone}>
              <picture>
                <source media={DESKTOP} srcSet={phoneSource.srcSet} sizes={phoneSource.sizes} />
                <img src={BLANK} alt="" width={phone.width} height={phone.height} className={styles.shot} decoding="async" />
              </picture>
            </div>
          </div>

          <HeroEstimate className={styles.card} />
        </div>

        {/* After the card in the DOM (and on phones), beside the copy on desktop. */}
        <div className={styles.next}>
          <Link href={SECONDARY_CTA.href} className={styles.secondary} data-cta-placement="home_hero_secondary">
            {SECONDARY_CTA.label}
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
          {HERO_PROOF ? (
            <figure className={styles.proof}>
              {HERO_PROOF.image ? (
                <Image src={HERO_PROOF.image} alt="" width={44} height={44} className={styles.avatar} />
              ) : null}
              <blockquote className={styles.proofQuote}>
                <p>“{HERO_PROOF.quote}”</p>
              </blockquote>
              <figcaption className={styles.proofBy}>
                {HERO_PROOF.name}, {HERO_PROOF.role}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </DepthScene>
  );
}
