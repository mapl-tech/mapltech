import Image from 'next/image';
import Link from 'next/link';
import LayerIndex from './LayerIndex';
import { LAYERS, LAYERS_INTRO, type Layer } from './content';
import styles from './Layers.module.scss';

/**
 * Act 4, Relief into competence. The heading holds still (sticky on wide
 * screens) while the four layers of a build pass beside it, each with real
 * deliverables and its real "from" price. Every visual is MAPL TECH's own
 * shipped work; the cloud layer, which has no screen, gets a labelled diagram.
 * Phones: no sticking, panels stack under the heading.
 */
export default function Layers() {
  return (
    <section className={styles.layers} aria-labelledby="layers-title" id="layers">
      <div className={styles.inner}>
        <div className={styles.rail}>
          <h2 id="layers-title" className={styles.title}>
            {LAYERS_INTRO.title}
          </h2>
          <p className={styles.lede}>{LAYERS_INTRO.lede}</p>
          <LayerIndex items={LAYERS.map(({ id, name, fromPrice }) => ({ id, name, fromPrice }))} />
        </div>

        <div className={styles.panels}>
          {LAYERS.map((layer) => (
            <LayerPanel key={layer.id} layer={layer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LayerPanel({ layer }: { layer: Layer }) {
  return (
    <article id={layer.id} className={styles.panel} aria-labelledby={`${layer.id}-name`}>
      <figure className={styles.media}>
        <div className={styles.frame}>
          {layer.image ? (
            <Image
              src={layer.image.src}
              alt={layer.image.alt}
              width={layer.image.width}
              height={layer.image.height}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={styles.shot}
            />
          ) : (
            <ShipDiagram />
          )}
        </div>
        {/* The structure behind the surface: an offset hairline frame, the page's recurring motif. */}
        <span className={styles.structure} aria-hidden="true" />
      </figure>

      <div className={styles.body}>
        <h3 id={`${layer.id}-name`} className={styles.name}>
          {layer.name}
        </h3>
        <p className={styles.summary}>{layer.summary}</p>
        <ul className={styles.deliverables} role="list">
          {layer.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={styles.meta}>
          <span className={styles.price}>{layer.fromPrice}</span>
          <Link href={layer.href} className={styles.more}>
            How we build {layer.name.toLowerCase()}
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </article>
  );
}

/** A labelled diagram (not a screenshot): how one change travels to production. */
const SHIP_STEPS = [
  { label: 'Commit', x: 60, y: 110 },
  { label: 'Automated tests', x: 240, y: 110 },
  { label: 'Preview build', x: 420, y: 110 },
  { label: 'Review', x: 420, y: 270 },
  { label: 'Production', x: 240, y: 270 },
  { label: 'Monitoring', x: 60, y: 270 },
] as const;

function ShipDiagram() {
  return (
    <svg className={styles.diagram} viewBox="0 0 600 400" role="img" aria-labelledby="ship-diagram-title">
      <title id="ship-diagram-title">
        Diagram: how a change ships. Commit, automated tests, preview build, review, production, then monitoring
        that feeds back into the next commit.
      </title>
      <rect x="0" y="0" width="600" height="400" fill="#0f1218" />
      <g stroke="rgba(246,243,239,0.07)" strokeWidth="1">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
        ))}
      </g>
      <g stroke="#F03350" strokeWidth="2" fill="none">
        <path d="M190 134H240M370 134H420M485 158V270M420 294H370M240 294H190" />
      </g>
      <path d="M60 294C18 294 18 134 60 134" fill="none" stroke="rgba(51,240,208,0.75)" strokeWidth="2" strokeDasharray="6 6" />
      {SHIP_STEPS.map((step) => (
        <g key={step.label}>
          <rect x={step.x} y={step.y} width="130" height="48" rx="8" fill="#141214" stroke="rgba(246,243,239,0.22)" />
          <text x={step.x + 65} y={step.y + 29} textAnchor="middle" fill="#F6F3EF" fontSize="15" fontFamily="var(--font-dm-sans), sans-serif">
            {step.label}
          </text>
        </g>
      ))}
      <text x="300" y="370" textAnchor="middle" fill="rgba(246,243,239,0.64)" fontSize="13" fontFamily="var(--font-dm-sans), sans-serif">
        Every change, every time. Monitoring feeds the next commit.
      </text>
    </svg>
  );
}
