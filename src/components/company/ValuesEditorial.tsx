import SectionHead from './SectionHead';
import styles from '@/app/company.module.scss';

/** The six current value cards consolidated into three editorial paragraphs (same sentences, no icons, no grid). */
export const VALUES = [
  {
    title: 'Embedded partnership',
    body:
      "We join your Slack, attend your standups, and use your tools. Your team should forget we're external. No jargon, no ghosting: weekly updates, documented decisions, and clean handoffs your team can act on immediately.",
  },
  {
    title: 'Code that lasts',
    body:
      "We write code your developers can read, extend, and maintain — not clever hacks that fall apart when we leave. Every component we build considers your existing stack, your team's capabilities, and where your agency is headed.",
  },
  {
    title: 'Post-launch commitment',
    body:
      "We don't ghost after deployment. Retainer models keep your systems secure, optimized, and evolving alongside your agency. Whether you're serving 10 clients or 100, our architecture decisions ensure your systems grow without breaking.",
  },
] as const;

export default function ValuesEditorial() {
  return (
    <section className={`${styles.section} reveal`} aria-labelledby="values-title" data-below-fold>
      <div className={styles.sectionInner}>
        <SectionHead eyebrow="05 · Values" title="What we stand for" id="values-title" />
        <div className={styles.values}>
          {VALUES.map((value) => (
            <div key={value.title} className={styles.value}>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueBody}>{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
