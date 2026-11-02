import styles from './OfficeMap.module.scss';

export type OfficeCity = 'Toronto' | 'Lagos' | 'Kingston';

interface Place {
  city: OfficeCity;
  country: string;
  note: string;
  lat: number;
  lon: number;
  /** Where the label sits relative to its node. */
  side: 'right' | 'left';
}

/** The three offices at their real coordinates (city centres, public geographic data). */
const PLACES: readonly Place[] = [
  { city: 'Toronto', country: 'Canada', note: 'Headquarters', lat: 43.65, lon: -79.38, side: 'right' },
  { city: 'Kingston', country: 'Jamaica', note: 'MAPL TECH Jamaica', lat: 17.97, lon: -76.79, side: 'right' },
  { city: 'Lagos', country: 'Nigeria', note: 'MAPL TECH Nigeria', lat: 6.52, lon: 3.38, side: 'left' },
];

// Equirectangular crop over the Atlantic: 120 degrees of longitude by 60 of latitude (2:1).
const WEST = -100;
const EAST = 20;
const NORTH = 58;
const SOUTH = -2;
const W = 1200;
const H = 600;

const px = (lon: number) => ((lon - WEST) / (EAST - WEST)) * W;
const py = (lat: number) => ((NORTH - lat) / (NORTH - SOUTH)) * H;
const pct = (value: number, of: number) => `${((value / of) * 100).toFixed(3)}%`;

function point(city: OfficeCity): [number, number] {
  const place = PLACES.find((p) => p.city === city)!;
  return [px(place.lon), py(place.lat)];
}

/** A quadratic arc between two offices, bowed toward the pole the way a great circle bows on this projection. */
function arc(from: OfficeCity, to: OfficeCity, bow: [number, number]): string {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  const cx = (x1 + x2) / 2 + bow[0];
  const cy = (y1 + y2) / 2 + bow[1];
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

const ARCS: readonly { id: string; from: OfficeCity; to: OfficeCity; bow: [number, number] }[] = [
  { id: 'toronto-kingston', from: 'Toronto', to: 'Kingston', bow: [-70, 0] },
  { id: 'toronto-lagos', from: 'Toronto', to: 'Lagos', bow: [0, -300] },
  { id: 'kingston-lagos', from: 'Kingston', to: 'Lagos', bow: [0, -90] },
];

const MERIDIANS = Array.from({ length: (EAST - WEST) / 10 + 1 }, (_, i) => WEST + i * 10);
const PARALLELS = [50, 40, 30, 20, 10, 0];

export interface OfficeMapProps {
  /** The branch this page is about: its node and arcs carry the red. */
  focus?: OfficeCity;
  /** Keep the caption for screen readers only (when a card overlaps the figure's foot). */
  captionHidden?: boolean;
  /** Replace the line under a city's name (e.g. its open roles on /careers). */
  notes?: Partial<Record<OfficeCity, string>>;
  caption?: string;
  /** 'load' when the map sits in a hero (on screen at load); 'scroll' draws as it scrolls in. */
  draw?: 'scroll' | 'load';
  className?: string;
}

const DEFAULT_CAPTION = 'Toronto, Kingston and Lagos, drawn to scale by latitude and longitude.';

/**
 * Where we work, as a structural drawing rather than a stock photo: the three
 * offices plotted to scale on a latitude and longitude grid, joined by red
 * arcs that draw as the figure scrolls into view (static under reduced
 * motion). Lines are SVG with non-scaling strokes; labels are HTML so they
 * stay legible at 360px. Server Component, no JavaScript.
 */
export default function OfficeMap({ focus, captionHidden = false, notes, caption = DEFAULT_CAPTION, draw = 'scroll', className = '' }: OfficeMapProps) {
  return (
    <figure className={`${styles.map} ${className}`.trim()} data-focus={focus} data-draw={draw}>
      <div className={styles.canvas}>
        <svg className={styles.lines} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <g className={styles.grid}>
            {MERIDIANS.map((lon) => (
              <line key={`m${lon}`} x1={px(lon)} y1={0} x2={px(lon)} y2={H} data-major={lon === 0 ? 'true' : undefined} />
            ))}
            {PARALLELS.map((lat) => (
              <line key={`p${lat}`} x1={0} y1={py(lat)} x2={W} y2={py(lat)} data-major={lat === 0 ? 'true' : undefined} />
            ))}
          </g>
          <g className={styles.arcs}>
            {ARCS.map((a) => (
              <path
                key={a.id}
                d={arc(a.from, a.to, a.bow)}
                className={styles.arc}
                data-id={a.id}
                data-lit={!focus || a.from === focus || a.to === focus ? 'true' : undefined}
              />
            ))}
          </g>
        </svg>

        <ul className={styles.places} role="list">
          {PLACES.map((place) => (
            <li
              key={place.city}
              className={styles.place}
              data-side={place.side}
              data-current={place.city === focus ? 'true' : undefined}
              style={{ left: pct(px(place.lon), W), top: pct(py(place.lat), H) }}
            >
              <span className={styles.node} aria-hidden="true" />
              <span className={styles.label}>
                <span className={styles.city}>{place.city}</span>
                <span className="visually-hidden">, </span>
                <span className={styles.note}>{notes?.[place.city] ?? (place.city === 'Toronto' ? place.note : place.country)}</span>
              </span>
            </li>
          ))}
        </ul>

        <span className={`${styles.axis} ${styles.axisEquator}`} aria-hidden="true">
          Equator
        </span>
        <span className={`${styles.axis} ${styles.axisMeridian}`} aria-hidden="true">
          0°
        </span>
      </div>
      <figcaption className={captionHidden ? 'visually-hidden' : styles.caption}>
        {caption}
      </figcaption>
    </figure>
  );
}
