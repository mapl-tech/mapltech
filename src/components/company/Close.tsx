import type { ReactNode } from 'react';
import Link from 'next/link';
import { ESTIMATE_SERVICES, SERVICE_META, estimateHref } from '@/lib/estimate';
import { startingFrom } from './regions';
import styles from './Close.module.scss';

/** The four services under their canonical names (SERVICE_META), never retyped. */
const CHOICES = ESTIMATE_SERVICES.map((service) => ({ service, label: SERVICE_META[service].label }));

export interface CloseProps {
  id: string;
  title: string;
  lede: string;
  /** `<page>`: prefix for data-cta-placement. */
  placement: string;
  /** Extra lines under the choices (e.g. the branch contact details). */
  children?: ReactNode;
}

/**
 * The family's last act before the footer. The footer already carries the
 * generic ask, so this one asks something smaller and more useful: what are
 * we building? Four choices, each with its real starting price, each opening
 * the estimator with that service selected (commitment and consistency: the
 * estimator echoes the choice back). A red structure line draws across the
 * top as the band scrolls in; static under reduced motion.
 */
export default function Close({ id, title, lede, placement, children }: CloseProps) {
  return (
    // data-page-close: the footer hides its own ask when a page ends on this one.
    <section className={styles.close} aria-labelledby={id} data-page-close>
      <div className={styles.inner}>
        <span className={styles.rule} aria-hidden="true" />
        <div className={styles.text}>
          <h2 id={id} className={styles.title}>
            {title}
          </h2>
          <p className={styles.lede}>{lede}</p>
        </div>
        <div className={styles.side}>
          <ul className={styles.choices} role="list">
            {CHOICES.map((choice) => (
              <li key={choice.service}>
                <Link
                  href={estimateHref({ services: [choice.service] })}
                  className={styles.choice}
                  data-cta-placement={`${placement}_close_${choice.service}`}
                >
                  <span className={styles.choiceName}>{choice.label}</span>{' '}
                  <span className={styles.choicePrice}>From {startingFrom(choice.service)}</span>
                  <span aria-hidden="true" className={styles.choiceArrow}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {/* Published on the live homepage (flagship/content.ts PROOF). */}
          <p className={styles.proof}>
            <span>
              <strong>200+</strong> projects supported
            </span>{' '}
            <span>
              <strong>25+</strong> years of combined engineering experience
            </span>
          </p>
          <p className={styles.alt}>
            Rather talk it through?{' '}
            <Link href="/contact-us" className={styles.altLink} data-cta-placement={`${placement}_close_call`}>
              Book a call
            </Link>
          </p>
          {children ? <div className={styles.extra}>{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
