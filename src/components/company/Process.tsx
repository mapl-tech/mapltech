import Image from 'next/image';
import { ABOUT, PROOF_QUOTE, indexOf } from './content';
import ed from './Company.module.scss';
import styles from './Process.module.scss';

/**
 * How MAPL TECH works behind an agency's brand, on paper: four numbered
 * stages with very large outline numerals, then the one approved client quote
 * as the proof of the last claim (code your developers can keep). The stages
 * also feed the HowTo JSON-LD, so the markup and the structured data are the
 * same list, and each stage keeps its `/about-us#how-…` anchor.
 */
export default function Process() {
  const { howWeWork } = ABOUT;
  return (
    <section id="how-we-work" className={ed.paper} aria-labelledby="process-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{howWeWork.label}</p>
          <h2 id="process-title" className={ed.title}>
            {howWeWork.title}
          </h2>
          <p className={ed.lede}>{howWeWork.lede}</p>
        </header>

        <ol className={styles.stages} role="list">
          {howWeWork.stages.map((stage, i) => (
            <li key={stage.id} id={stage.id} className={styles.stage}>
              <span className={styles.number} aria-hidden="true">
                {indexOf(i)}
              </span>
              <h3 className={styles.name}>{stage.name}</h3>
              <p className={styles.text}>{stage.text}</p>
            </li>
          ))}
        </ol>

        <p className={styles.after}>{howWeWork.after}</p>

        {PROOF_QUOTE ? (
          <figure className={styles.quote}>
            <blockquote className={styles.quoteText}>
              <p>“{PROOF_QUOTE.quote}”</p>
            </blockquote>
            <figcaption className={styles.quoteBy}>
              {PROOF_QUOTE.image ? (
                <Image src={PROOF_QUOTE.image} alt="" width={56} height={56} className={styles.avatar} />
              ) : null}
              <span>
                <span className={styles.quoteName}>{PROOF_QUOTE.name}</span>
                <span className="visually-hidden">, </span>
                <span className={styles.quoteRole}>
                  {PROOF_QUOTE.role}, {PROOF_QUOTE.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
