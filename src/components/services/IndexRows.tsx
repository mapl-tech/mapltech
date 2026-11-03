import Link from 'next/link';
import { BrowserFrame, DesktopShot } from './Frames';
import IndexPreview from './IndexPreview';
import PipelineDiagram from './PipelineDiagram';
import { LAYER_VIEWS, briefHref, rowExample, type LayerView } from './serviceContent';
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
 * The four services as a big index: what the service is in a few words, the
 * name as large as the row allows, the one-line summary, the public "from"
 * price right under it and an arrow. Each row is one link to the service
 * page, named by the service and its price (the summary is its description,
 * as on the homepage's index). Under it, two separate small links (never
 * nested in the row's link, and 8px clear of it): one real project for that
 * service with one of its published results beside it, and a quiet "Start a
 * … project" that opens the brief with the service chosen. On desktop a
 * preview of real work trails the cursor (IndexPreview); wide touch screens
 * and reduced motion get the same exhibit inline in the row; phones and
 * tablets keep the rows short.
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
          <Row key={layer.slug} layer={layer} index={i} />
        ))}
      </ol>
    </IndexPreview>
  );
}

/** "a Web Development project", "an Automation & AI project". */
const projectOf = (name: string) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name} project`;

function Row({ layer, index }: { layer: LayerView; index: number }) {
  const example = rowExample(layer);
  const id = `index-${layer.service}`;
  return (
    <li className={styles.row} data-index={index}>
      {/* Named "Web Development. From $5,000"; the summary is the description. */}
      <Link
        href={layer.path}
        className={styles.link}
        aria-labelledby={`${id}-name ${id}-meta`}
        aria-describedby={`${id}-summary`}
        data-cta-placement={`services_index_${layer.service}`}
      >
        <span className={styles.kicker}>{layer.role}</span>
        {/* A heading inside the row link: heading navigation lands on each service. */}
        <h3 id={`${id}-name`} className={styles.name}>
          {layer.name}
          <span className="visually-hidden">. </span>
        </h3>
        <span id={`${id}-summary`} className={styles.summary}>
          {layer.summary}
        </span>
        <div className={styles.media} aria-hidden="true">
          <Exhibit layer={layer} sizes="560px" />
        </div>
        <span id={`${id}-meta`} className={styles.meta}>
          {layer.fromLabel}
        </span>
        <span className={styles.go} aria-hidden="true">
          →
        </span>
      </Link>
      <div className={styles.foot}>
        {example ? (
          <p className={styles.example}>
            <Link
              href={example.href}
              className={styles.exampleLink}
              data-cta-placement={`services_index_${layer.service}_example`}
            >
              <span>
                <span className={styles.exampleLabel}>Example:</span> {example.client}
              </span>
              <span className="visually-hidden">, a case study for {layer.name}</span>
              <span aria-hidden="true" className={styles.exampleArrow}>
                →
              </span>
            </Link>
            {/* One result the case study publishes, as the evidence beside the link. */}
            {example.metric ? (
              <span className={styles.exampleMetric}>
                <span className={styles.exampleValue}>{example.metric.value}</span> {example.metric.label}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className={styles.start}>
          <Link
            href={briefHref(layer.service)}
            className={styles.startLink}
            data-cta-placement={`services_index_${layer.service}_start`}
          >
            Start {projectOf(layer.name)}
            <span aria-hidden="true" className={styles.exampleArrow}>
              →
            </span>
          </Link>
        </p>
      </div>
    </li>
  );
}
