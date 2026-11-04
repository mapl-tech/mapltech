import Image from 'next/image';
import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import { ABOUT, FOUNDERS, FOUNDER_NAMES } from './content';
import ed from './Company.module.scss';
import styles from './Story.module.scss';

/**
 * Our story, in the founders' voice: the reason, set large and fully lit
 * from the first frame, then the two paragraphs that explain it, signed by
 * the two people who wrote it. The second paragraph ends on whose names the
 * work carries, so the page's route to the work ("See the work", the site's
 * text action) sits right under it, in the same column. It follows the page
 * hero directly (the figures sit in the hero's aside), so the seam takes the
 * family's hairline, as /pricing's estimator does under its hero.
 */
export default function Story() {
  const { story } = ABOUT;
  const last = story.paragraphs.length - 1;
  return (
    <section id="why" className={`${ed.dark} ${ed.ruled}`} aria-labelledby="story-title">
      <div className={`${ed.inner} ${styles.grid}`}>
        {/* The reason is the section's heading; the small label above it is a kicker. */}
        <p className={ed.label}>{story.label}</p>

        <div className={styles.body}>
          <h2 id="story-title" className={styles.lead}>
            {story.lead.map((run) =>
              run.accent ? (
                <span key={run.text} className={styles.accent}>
                  {run.text}
                </span>
              ) : (
                run.text
              ),
            )}
          </h2>

          <div className={styles.columns}>
            {story.paragraphs.map((paragraph, i) =>
              i === last ? (
                <div key={paragraph.slice(0, 32)} className={styles.closing}>
                  <p>{paragraph}</p>
                  <Link href={story.work.href} className={ed.action} data-cta-placement="about_story_work">
                    {story.work.label}
                    <span aria-hidden="true" className={ed.arrow}>
                      <Arrow />
                    </span>
                  </Link>
                </div>
              ) : (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ),
            )}
          </div>

          <div className={styles.sign}>
            <span className={styles.faces} aria-hidden="true">
              {FOUNDERS.map((founder) => (
                <Image key={founder.slug} src={founder.avatar} alt="" width={52} height={52} sizes="52px" className={styles.face} />
              ))}
            </span>
            <p className={styles.signText}>
              <span className={styles.signNames}>{FOUNDER_NAMES}</span>
              <span className="visually-hidden">, </span>
              <span className={styles.signRole}>{story.signature}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
