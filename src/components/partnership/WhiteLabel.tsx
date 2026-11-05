import Image from 'next/image';
import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { SPOTLIGHT } from '@/components/flagship/content';
import ed from '@/components/company/Company.module.scss';
import { WHITE_LABEL } from './content';
import styles from './WhiteLabel.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * Who does what (paper): the white-label split, said once, as two short
 * ruled lists side by side from 768px. Each line is a bold lead and one
 * plain sentence, so a founder can scan the leads alone.
 */
export function Roles() {
  const { roles } = WHITE_LABEL;
  return (
    <section className={ed.paper} aria-labelledby="roles-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{roles.label}</p>
          <h2 id="roles-title" className={ed.title}>
            {roles.title}
          </h2>
          <p className={ed.lede}>{roles.lede}</p>
        </header>

        <div className={styles.roles}>
          {[
            { id: 'roles-yours', ...roles.yours },
            { id: 'roles-ours', ...roles.ours },
          ].map((side) => (
            <section key={side.id} className={styles.side} aria-labelledby={side.id}>
              <h3 id={side.id} className={styles.sideHeading}>
                {side.heading}
              </h3>
              <ul className={styles.sideList} role="list">
                {side.items.map((item) => (
                  <li key={item.lead} className={styles.sideItem}>
                    <strong className={styles.lead}>{item.lead}</strong> {item.text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * When to bring us in (dark): three plain options, ours last and marked by
 * its rule and its ask, so the advice reads as advice, not a sales table.
 */
export function Fit() {
  const { fit } = WHITE_LABEL;
  return (
    <section className={ed.dark} aria-labelledby="fit-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{fit.label}</p>
          <h2 id="fit-title" className={ed.title}>
            {fit.title}
          </h2>
          <p className={ed.lede}>{fit.lede}</p>
        </header>

        <ul className={styles.options} role="list">
          {fit.options.map((option) => (
            <li key={option.heading} className={styles.option} data-ours={'ours' in option ? '' : undefined}>
              <h3 className={styles.optionHeading}>{option.heading}</h3>
              <p className={styles.optionText}>{option.text}</p>
              {'ours' in option ? (
                <Link href={PROJECT_HREF} className={styles.optionAction} data-cta-placement="white_label_fit">
                  {PROJECT_LABEL}
                  <span aria-hidden="true" className={styles.arrow}>
                    <Arrow />
                  </span>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The approved client quote, in full: it is about exactly this, working as
 * part of the client's team (site.ts testimonials, LRO Staffing).
 */
export function Voice() {
  if (!SPOTLIGHT) return null;
  return (
    <section className={`${ed.dark} ${ed.ruled}`} aria-labelledby="voice-title">
      <div className={ed.inner}>
        <h2 id="voice-title" className={ed.label}>
          {WHITE_LABEL.voice.label}
        </h2>
        <figure className={styles.voice}>
          <blockquote className={styles.voiceQuote}>
            <p>“{SPOTLIGHT.quote}”</p>
          </blockquote>
          <figcaption className={styles.voiceBy}>
            {SPOTLIGHT.image ? (
              <Image src={SPOTLIGHT.image} alt="" width={56} height={56} className={styles.voiceAvatar} />
            ) : null}
            <span>
              <span className={styles.voiceName}>{SPOTLIGHT.name}</span>
              <span className={styles.voiceRole}>
                {SPOTLIGHT.role}, {SPOTLIGHT.company}
              </span>
            </span>
          </figcaption>
        </figure>
        <Link href="/our-work" className={styles.voiceAction} data-cta-placement="white_label_work">
          See the work
          <span aria-hidden="true" className={styles.arrow}>
            <Arrow />
          </span>
        </Link>
      </div>
    </section>
  );
}
