import { executives } from '@/config/team';
import styles from '@/app/company.module.scss';

/** Current about-page copy ("Who We Are"), unchanged. No founder video exists, so this is the text version only. */
export const FOUNDER_STORY = {
  eyebrow: '02 · Founder story',
  heading: 'Your engineering team — without the overhead',
  pullQuote: "We don't compete with you. We amplify you.",
  paragraphs: [
    "MAPL TECH exists because agencies shouldn't need to hire a full engineering department to take on complex projects. We give you the technical muscle on demand.",
    'Headquartered in Toronto and Ottawa, Canada, with branches in Nigeria and Jamaica — we bring 25+ years of combined experience across systems architecture, automation, web development, and AI to agencies worldwide.',
    "We don't compete with you. We amplify you. When your clients need custom development, complex integrations, or intelligent automation, we're the team that makes it ship.",
  ],
} as const;

export default function FounderStory() {
  return (
    <section className={`${styles.section} reveal`} aria-labelledby="founder-title">
      <div className={styles.sectionInner}>
        <div className={styles.founder}>
          <div>
            <p className={`eyebrow ${styles.sectionEyebrow}`}>{FOUNDER_STORY.eyebrow}</p>
            <blockquote className={styles.pullQuote}>
              <p>{FOUNDER_STORY.pullQuote}</p>
            </blockquote>
            <ul className={styles.signature} aria-label="Co-founders">
              {executives.map((exec) => (
                <li key={exec.name}>
                  <span className={styles.signatureName}>{exec.name}</span>
                  <span className={styles.signatureRole}>{exec.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.prose}>
            <h2 id="founder-title" className={styles.h2}>
              {FOUNDER_STORY.heading}
            </h2>
            {FOUNDER_STORY.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
