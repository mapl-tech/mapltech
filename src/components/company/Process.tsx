import Image from 'next/image';
import { ABOUT, PROOF_QUOTE } from './content';
import styles from './Process.module.scss';

/**
 * How MAPL TECH works behind an agency's brand: four stages hanging off a red
 * structure line that draws as you read (the case template's stages idiom),
 * then the one approved client quote as the proof for the last claim ("code
 * your developers can keep"). The stages also feed the HowTo JSON-LD, so the
 * markup and the structured data are the same list.
 */
export default function Process() {
  const { howWeWork } = ABOUT;
  return (
    <section id="how-we-work" className={styles.process} aria-labelledby="process-title">
      <div className={styles.inner}>
        <div className={styles.rail}>
          <h2 id="process-title" className={styles.h2}>
            {howWeWork.title}
          </h2>
          <p className={styles.lede}>{howWeWork.lede}</p>
        </div>

        <div className={styles.body}>
          <ol className={styles.stages} role="list">
            {howWeWork.stages.map((stage) => (
              <li key={stage.id} id={stage.id} className={styles.stage}>
                <h3 className={styles.stageName}>{stage.name}</h3>
                <p className={styles.stageText}>{stage.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.after}>{howWeWork.after}</p>

          {PROOF_QUOTE ? (
            <figure className={styles.quote}>
              <span className={styles.quoteSurface} aria-hidden="true" />
              <blockquote className={styles.quoteText}>
                <p>{PROOF_QUOTE.quote}</p>
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
      </div>
    </section>
  );
}
