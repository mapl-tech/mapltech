/**
 * The structural trace drawn over the desktop hero plate
 * (src/assets/flagship/tower-desktop.jpg, 2560x1446).
 *
 * Measured off the plate in source pixels: the column centrelines at the top
 * and bottom of the open floors, the corner where the two faces meet, and the
 * slab edges, whose slope flattens toward the horizon (perspective). The SVG
 * uses the same viewBox and `xMidYMid slice` as the image's centred
 * `object-fit: cover`, so the lines stay on the steel at every viewport.
 */
export const TRACE_VIEWBOX = { width: 2560, height: 1446 } as const;

type Point = readonly [number, number];
export type Segment = readonly [Point, Point];

const TOP = 425;
const BOTTOM = 945;

/** Column centrelines [x at TOP, x at BOTTOM]: left face, corner, right face. */
const COLUMNS: readonly (readonly [number, number])[] = [
  [1319, 1325],
  [1387, 1400],
  [1468, 1495],
  [1560, 1592],
  [1683, 1745], // corner
  [1800, 1852],
  [1868, 1937],
  [1950, 2028],
];

export const COLUMN_SEGMENTS: readonly Segment[] = COLUMNS.map(([top, bottom]) => [
  [top, TOP],
  [bottom, BOTTOM],
]);

const cornerX = (y: number) => 1683 + (y - 399) * 0.113;
const leftEdgeX = (y: number) => 1319 + (y - TOP) * 0.0115;
const rightEdgeX = (y: number) => 1950 + (y - TOP) * 0.15;

/** Ten open floors above the glass, 51.3px apart at the corner. */
export const FLOOR_SEGMENTS: readonly Segment[] = Array.from({ length: 10 }, (_, i) => {
  const y = 399 + i * 51.3;
  const t = i / 9;
  const slopeLeft = 0.33 - 0.12 * t; // drop per px travelled left
  const slopeRight = 0.27 - 0.14 * t; // drop per px travelled right
  const cx = cornerX(y);
  const lx = leftEdgeX(y);
  const rx = rightEdgeX(y);
  return [
    [
      [lx, y + slopeLeft * (cx - lx)],
      [cx, y],
    ],
    [
      [cx, y],
      [rx, y + slopeRight * (rx - cx)],
    ],
  ] as const;
}).flat();

/** Two nodes on the load path: the top of the corner column and where it meets the glass. */
export const NODES: readonly Point[] = [
  [cornerX(399), 399],
  [cornerX(912), 912],
];

export function segmentPath([[x1, y1], [x2, y2]]: Segment): string {
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
