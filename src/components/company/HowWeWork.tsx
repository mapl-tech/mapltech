import SectionHead from './SectionHead';
import styles from '@/app/company.module.scss';

export const HOW_WE_WORK_NAME = 'How MAPL TECH works with agencies';

/** Source of truth for both the rendered steps and the HowTo JSON-LD. Copy is the current about page's "Our Approach" + values text. */
export const HOW_WE_WORK_STEPS = [
  {
    name: 'Scope',
    text: "A 20-min scoping call and a fixed price range before any work starts. We don't operate like a vendor behind a ticket queue.",
  },
  {
    name: 'Build',
    text: 'We integrate directly into your workflow — using your tools, joining your meetings, communicating the way your team prefers. Weekly updates and documented decisions.',
  },
  {
    name: 'Hand-off',
    text: 'Clean handoffs your team can act on immediately: code your developers can read, extend, and maintain. Retainer models keep your systems secure, optimized, and evolving alongside your agency.',
  },
] as const;

const FOOTNOTE = 'Single project or long-term partnership — every engagement gets the same engineering rigor and attention.';

/** Numbered process. The connector rule draws itself with a CSS view() timeline; no JS. */
export default function HowWeWork() {
  return (
    <section className={`${styles.section} reveal`} aria-labelledby="process-title">
      <div className={styles.sectionInner}>
        <SectionHead eyebrow="03 · How we work with agencies" title="Partnership, not outsourcing" id="process-title" />
        <ol className={styles.steps}>
          {HOW_WE_WORK_STEPS.map((step, index) => (
            <li key={step.name} className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.stepTitle}>{step.name}</h3>
              <p className={styles.stepBody}>{step.text}</p>
            </li>
          ))}
        </ol>
        <p className={styles.stepsFoot}>{FOOTNOTE}</p>
      </div>
    </section>
  );
}
