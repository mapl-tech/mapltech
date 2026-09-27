'use client';

import { useState } from 'react';
import TimezoneOverlap, { OFFICES } from '@/components/ui/TimezoneOverlap';
import styles from './OverlapExplorer.module.scss';

/**
 * The PEAK on /about-us, /nigeria and /jamaica: the TimezoneOverlap strip
 * (interaction #10) plus an axis picker. By default the 24h axis is the
 * visitor's own day; the chips re-plot the three office windows as seen from
 * Toronto, Lagos or Kingston, so an agency owner anywhere can read the shared
 * window for the branch they are evaluating. The island itself is untouched:
 * chips only change its `visitorZone` prop.
 */

interface AxisOption {
  key: string;
  label: string;
  timeZone?: string;
}

const AUTO: AxisOption = { key: 'auto', label: 'Your zone' };

const OPTIONS: readonly AxisOption[] = [AUTO, ...OFFICES.map((office) => ({ key: office.timeZone, label: office.city, timeZone: office.timeZone }))];

export interface OverlapExplorerProps {
  /** Initial axis: 'auto' (visitor's zone) or an office IANA zone. */
  defaultZone?: string;
}

export default function OverlapExplorer({ defaultZone = 'auto' }: OverlapExplorerProps) {
  const [zone, setZone] = useState(defaultZone);
  const selected = OPTIONS.find((option) => option.key === zone) ?? AUTO;

  return (
    <div className={styles.explorer}>
      <div className={styles.axis} role="group" aria-label="Plot the working day as seen from">
        <span className={styles.axisLabel} aria-hidden="true">
          Axis
        </span>
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={styles.zone}
            aria-pressed={option.key === selected.key}
            onClick={() => setZone(option.key)}
            data-cursor="estimate"
          >
            {option.label}
          </button>
        ))}
      </div>
      <TimezoneOverlap visitorZone={selected.timeZone} />
    </div>
  );
}
