import Link from 'next/link';
import { BrowserFrame, DesktopShot } from './Frames';
import IndexPreview from './IndexPreview';
import PipelineDiagram from './PipelineDiagram';
import { LAYER_VIEWS, type LayerView } from './serviceContent';
import styles from './IndexRows.module.scss';

/** "lrostaffing.com" for the preview's address bar, from the capture's case. */
const PREVIEW_URL: Partial<Record<string, string>> = {
  web: 'lrostaffing.com',
  automation: 'mapltours.com',
  tools: 'lrostaffing.com/lro-salary-guide',
};

/** Real work for a line (the live site in a browser), or the pipeline for Cloud, which has no screen. */
function Exhibit({ layer, sizes }: { layer: LayerView; sizes: string }) {
  if (!layer.exhibit) return <PipelineDiagram variant="mini" />;
  return (
    <BrowserFrame url={PREVIEW_URL[layer.service]}>
      <DesktopShot src={layer.exhibit.src} alt="" sizes={sizes} />
    </BrowserFrame>
  );
}

/**
 * The four service lines as a big numbered index: numeral and what the line
 * is, the name as large as the row allows, the one-line summary, the public
 * "from" price and an arrow. Each row is one link to the service page. On
 * desktop a preview of real work trails the cursor (IndexPreview); touch and
 * reduced motion get the same exhibit inline in the row.
 */
export default function IndexRows({ labelId }: { labelId: string }) {
  return (
    <IndexPreview
      frames={LAYER_VIEWS.map((layer) => (
        <Exhibit key={layer.slug} layer={layer} sizes="440px" />
      ))}
    >
      <ol className={styles.rows} aria-labelledby={labelId}>
        {LAYER_VIEWS.map((layer, i) => (
          <li key={layer.slug} className={styles.row} data-index={i}>
            <Link href={layer.path} className={styles.link} data-cta-placement={`services_index_${layer.service}`}>
              <span className={styles.kicker}>
                <span className={styles.numeral} aria-hidden="true">
                  {layer.numeral}
                </span>
                <span className={styles.role}>
                  {layer.role}
                  <span className="visually-hidden">: </span>
                </span>
              </span>
              <span className={styles.name}>
                {layer.name}
                <span className="visually-hidden">. </span>
              </span>
              <span className={styles.summary}>
                {layer.summary}
                <span className="visually-hidden"> </span>
              </span>
              <div className={styles.media} aria-hidden="true">
                <Exhibit layer={layer} sizes="(min-width: 768px) 560px, 92vw" />
              </div>
              <span className={styles.meta}>{layer.fromLabel}</span>
              <span className={styles.go} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </IndexPreview>
  );
}
