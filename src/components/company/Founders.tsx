import Image from 'next/image';
import Link from 'next/link';
import { ABOUT, FOUNDERS, FOUNDER_NAMES, TEAM, keepBrand, type Founder } from './content';
import styles from './Founders.module.scss';

/**
 * The two founders, the only people on the site with real photographs. One
 * photo treatment for both (full grayscale, the homepage's), framed as a
 * finished surface with the red structure frame behind it.
 *
 * - `FoundersStory` (/about-us): why MAPL TECH exists, in the founders' voice,
 *   beside the two portraits.
 * - `FounderProfiles` (/team): full bios from team.ts with the `/team#slug`
 *   anchors that the Person JSON-LD points at.
 */

function Portrait({ founder, sizes }: { founder: Founder; sizes: string }) {
  const src = founder.portrait;
  return (
    <figure className={styles.frame}>
      <span className={styles.photoWrap}>
        <Image
          src={src}
          alt={`${founder.name}, ${founder.title} of MAPL TECH`}
          {...(typeof src === 'string' ? { width: 400, height: 400 } : {})}
          sizes={sizes}
          className={styles.photo}
          style={{ objectPosition: founder.objectPosition }}
        />
      </span>
    </figure>
  );
}

function LinkedIn({ founder }: { founder: Founder }) {
  return (
    <a href={founder.linkedin} className={styles.linkedin} target="_blank" rel="noopener noreferrer">
      {founder.name.split(' ')[0]} on LinkedIn
      <span className="visually-hidden"> (opens in a new tab)</span>
      <span aria-hidden="true" className={styles.external}>
        ↗
      </span>
    </a>
  );
}

export function FoundersStory() {
  const { story } = ABOUT;
  return (
    <section id="founders" className={styles.story} aria-labelledby="story-title">
      <div className={styles.storyInner}>
        <div className={styles.storyText}>
          <h2 id="story-title" className={styles.h2}>
            {keepBrand(story.title)}
          </h2>
          <p className={styles.lead}>{keepBrand(story.lead)}</p>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          <p className={styles.paragraph}>
            {story.workLink.before}
            <Link href={story.workLink.href} className={styles.inline}>
              {story.workLink.label}
            </Link>
            {story.workLink.after}
          </p>
          <p className={styles.signature}>
            <span className={styles.signatureNames}>{FOUNDER_NAMES}</span>
            <span className="visually-hidden">, </span>
            <span className={styles.signatureRole}>{story.signature}</span>
          </p>
        </div>

        <ul className={styles.people} role="list">
          {FOUNDERS.map((founder) => (
            <li key={founder.slug} className={styles.person}>
              <Portrait founder={founder} sizes="(min-width: 1024px) 24vw, 45vw" />
              <p className={styles.name}>{founder.name}</p>
              <p className={styles.role}>{founder.title}</p>
              <p className={styles.focus}>{founder.focus}</p>
              <LinkedIn founder={founder} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FounderProfiles() {
  return (
    <section id="founders" className={styles.profilesSection} aria-labelledby="founders-title">
      <div className={styles.profilesInner}>
        <header className={styles.profilesHead}>
          <h2 id="founders-title" className={styles.h2}>
            {TEAM.founders.title}
          </h2>
          <p className={styles.profilesLede}>{TEAM.founders.lede}</p>
        </header>
        <ol className={styles.profiles} role="list">
          {FOUNDERS.map((founder, index) => (
            <li key={founder.slug} id={founder.slug} className={styles.profile} data-flip={index % 2 === 1 ? 'true' : undefined}>
              <Portrait founder={founder} sizes="(min-width: 1024px) 34vw, 86vw" />
              <div className={styles.profileText}>
                <h3 className={styles.profileName}>{founder.name}</h3>
                <p className={styles.profileRole}>{founder.title}</p>
                <p className={styles.profileBio}>{founder.bio}</p>
                <LinkedIn founder={founder} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
