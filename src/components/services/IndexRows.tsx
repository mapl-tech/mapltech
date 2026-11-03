import Image from 'next/image';
import Link from 'next/link';
import { BrowserFrame, DesktopShot } from './Frames';
import IndexPreview from './IndexPreview';
import PipelineDiagram from './PipelineDiagram';
import { withLastWord } from './keepTogether';
import { ESTIMATE_LABEL, LAYER_VIEWS, briefHref, rowExample, type LayerView } from './serviceContent';
import styles from './IndexRows.module.scss';
import Arrow from '@/components/ui/Arrow';

/** "lrostaffing.com" for the preview's address bar, from the capture's case. */
const PREVIEW_URL: Partial<Record<string, string>> = {
  web: 'lrostaffing.com',
  tools: 'lrostaffing.com/lro-salary-guide',
};

/**
 * Real work for a line, always the row's own example: the live site in a browser; for an example
 * with no screen to show (Crowned Spice's automations run behind its store), its logo and the
 * stages we automated, in its case study's words; the pipeline for Cloud.
 */
function Exhibit({ layer, sizes }: { layer: LayerView; sizes: string }) {
  if (!layer.exhibit) return <PipelineDiagram variant="mini" />;
  const board = layer.exhibit.board ? rowExample(layer) : null;
  return (
    <BrowserFrame url={PREVIEW_URL[layer.service]}>
      {board ? (
        <div className={styles.board}>
          <Image src={layer.exhibit.src} alt="" width={320} height={320} sizes="160px" className={styles.boardMark} />
          <div className={styles.boardText}>
            <span className={styles.boardClient}>{board.client}</span>
            <ol className={styles.boardStages}>
              {board.stages.map((stage) => (
                <li key={stage}>{stage}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <DesktopShot src={layer.exhibit.src} alt="" sizes={sizes} />
      )}
    </BrowserFrame>
  );
}

/**
 * The four services as a big index: what the service is in a few words, the
 * name as large as the row allows, the one-line summary, the public "from"
 * price right under it and an arrow. Each row is one link to the service
 * page, named by the service and its price (the summary is its description,
 * as on the homepage's index). Under it, separate small links (never nested
 * in the row's link, and 8px clear of it): one real project for that service
 * with one of its published results (or, without one, one thing it does)
 * beside it; then the row's actions, as the hero's pair: "Start a … project",
 * an outlined button that opens the brief with the service chosen, and a
 * quiet "Price your project" that opens the estimator with it selected (the
 * label every estimator link carries; "See pricing" is /pricing itself). With
 * an ask in every row, the phone bar steps aside over the list
 * (data-bar-stand-down). On desktop a preview of the row's example trails the
 * cursor (IndexPreview); wide touch screens and reduced motion get the same
 * exhibit inline in the row; phones and tablets keep the rows short.
 */
export default function IndexRows({ labelId }: { labelId: string }) {
  return (
    <IndexPreview
      frames={LAYER_VIEWS.map((layer) => (
        <Exhibit key={layer.slug} layer={layer} sizes="440px" />
      ))}
    >
      <ol className={styles.rows} aria-labelledby={labelId} data-bar-stand-down="">
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
    <li className={styles.row}>
      {/* Named "Web Development. From $5,000"; the summary is the description. The trailing preview
          follows this link only (data-index), never the foot, whose example can be another project. */}
      <Link
        href={layer.path}
        className={styles.link}
        data-index={index}
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
          <Arrow />
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
              {/* One flex item: a name that wraps keeps its last word and the arrow together, after the words. */}
              <span>
                <span className={styles.exampleLabel}>Example:</span>{' '}
                {withLastWord(
                  example.client,
                  <>
                    <span className="visually-hidden">, a case study for {layer.name}</span>
                    <span aria-hidden="true" className={styles.exampleArrow}>
                      <Arrow />
                    </span>
                  </>,
                )}
              </span>
            </Link>
            {/* One result the case study publishes, as the evidence beside the link, or one thing it built. */}
            {example.metric ? (
              <span className={styles.exampleMetric}>
                <span className={styles.exampleValue}>{example.metric.value}</span> {example.metric.label}
              </span>
            ) : example.fact ? (
              <span className={styles.exampleMetric}>{example.fact}</span>
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
            <span aria-hidden="true" className={styles.startArrow}>
              <Arrow />
            </span>
          </Link>
          <Link href={layer.estimate} className={styles.priceLink} data-cta-placement={`services_index_${layer.service}_price`}>
            {ESTIMATE_LABEL}
            <span className="visually-hidden"> for {layer.name}</span>
          </Link>
        </p>
      </div>
    </li>
  );
}
