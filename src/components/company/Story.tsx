import Image from 'next/image';
import Link from 'next/link';
import { ABOUT, FOUNDERS, FOUNDER_NAMES } from './content';
import ed from './Company.module.scss';
import styles from './Story.module.scss';

/**
 * Why MAPL TECH exists, in the founders' voice: the reason, set large and
 * fully lit from the first frame, then the two paragraphs that explain it,
 * signed by the two people who wrote it.
 */
export default function Story() {
  const { story } = ABOUT;
  return (
    <section id="why" className={ed.dark} aria-labelledby="story-title">
      <div className={`${ed.inner} ${styles.grid}`}>
        <h2 id="story-title" className={ed.label}>
          {story.label}
        </h2>

        <div className={styles.body}>
          <p className={styles.lead}>
            {story.lead.map((run) =>
              run.accent ? (
                <span key={run.text} className={styles.accent}>
                  {run.text}
                </span>
              ) : (
                run.text
              ),
            )}
          </p>

          <div className={styles.columns}>
            {story.paragraphs.map((paragraph, i) => (
              <p key={paragraph.slice(0, 32)}>
                {paragraph}
                {/* The work link closes the last paragraph, in the founders' own sentence. */}
                {i === story.paragraphs.length - 1 ? (
                  <>
                    {' '}
                    {story.workLink.before}
                    <Link href={story.workLink.href} className={styles.inline} data-cta-placement="about_story_work">
                      {story.workLink.label}
                    </Link>
                    {story.workLink.after}
                  </>
                ) : null}
              </p>
            ))}
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
