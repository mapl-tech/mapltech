import type { CSSProperties } from 'react';
import styles from './PipelineDiagram.module.scss';

/**
 * Cloud Engineering has no screen to show, so its exhibit is how an update
 * goes live on hosting we set up, laid out as the path a change travels, in
 * plain words. Each stage is a cloud deliverable in site.ts `pricing` or
 * services.ts: CI/CD ("Automated build, test, and deploy pipelines"),
 * "Staging, production, and preview environments", "Uptime monitoring &
 * alerting".
 *
 * `card`: the proof exhibit, a real list with a caption; the path draws as it
 * scrolls through (CSS view timeline, transform only, static elsewhere).
 * `mini`: the index preview, decoration inside an aria-hidden frame.
 */
const STAGES = ['Change', 'Tests', 'Preview', 'Review', 'Live', 'Monitoring'] as const;

export default function PipelineDiagram({ variant = 'card', className }: { variant?: 'card' | 'mini'; className?: string }) {
  const card = variant === 'card';
  return (
    <figure className={[styles.pipeline, className].filter(Boolean).join(' ')} data-variant={variant}>
      <div className={styles.frame}>
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.chromeLabel}>How an update goes live</span>
        </div>
        <div className={styles.board}>
          <ol className={styles.stages} aria-label={card ? 'How an update goes live' : undefined}>
            {STAGES.map((stage, i) => (
              <li
                key={stage}
                className={styles.stage}
                data-live={stage === 'Live' ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <span className={styles.no} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.name}>{stage}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {card ? (
        <figcaption className={styles.caption}>
          A diagram, not a screenshot. On hosting we set up, every change is built and tested automatically,
          previewed and reviewed, then goes live and is monitored. What monitoring finds shapes the next change.
        </figcaption>
      ) : null}
    </figure>
  );
}
