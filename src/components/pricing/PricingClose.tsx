import Image from 'next/image';
import { PROOF as HOME_PROOF } from '@/components/flagship/content';
import EstimateEcho from './EstimateEcho';
import { CLOSE, PROOF } from './content';
import styles from './PricingSections.module.scss';

/**
 * Resolve: the reader's own number and the next step side by side with the one
 * approved client quote and the client logos the homepage already shows (same
 * source list), so the final decision has proof beside it.
 */
export default function PricingClose() {
  return (
    // data-page-close: the footer's own ask hides itself, so the page ends on one ask.
    <section className={styles.close} aria-labelledby="close-title" data-page-close="">
      <div className={styles.closeWrap}>
        <div className={styles.closeInner}>
          <div className={styles.closeMain}>
            <h2 id="close-title" className={styles.closeTitle}>
              {CLOSE.title}
            </h2>
            <p className={styles.closeLede}>{CLOSE.lede}</p>
            <EstimateEcho />
          </div>

          <div className={styles.proofCol}>
            {PROOF ? (
              <figure className={styles.proof}>
                <blockquote className={styles.proofQuote}>
                  <p>{PROOF.quote}</p>
                </blockquote>
                <figcaption className={styles.proofBy}>
                  {PROOF.image ? <Image src={PROOF.image} alt="" width={56} height={56} className={styles.avatar} /> : null}
                  <span>
                    <span className={styles.proofName}>{PROOF.name}</span>
                    <span className={styles.proofRole}>
                      {PROOF.role}, {PROOF.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ) : null}

            {HOME_PROOF.logos.length > 0 ? (
              <div className={styles.clients}>
                <p className={styles.clientsLabel}>Clients</p>
                <ul className={styles.logos} role="list">
                  {HOME_PROOF.logos.map((logo) => (
                    <li key={logo.name}>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={logo.width}
                        height={logo.height}
                        className={logo.invert ? styles.logoInvert : styles.logoMono}
                        style={{ height: logo.height, width: 'auto' }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
