'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import towerDesktop from '@/assets/flagship/tower-desktop.jpg';
import { HERO, XRAY } from './content';
import { formatKb, formatSeconds, usePageTelemetry, type Telemetry } from './telemetry';
import styles from './XRay.module.scss';

/**
 * Act 6, the PEAK and the signature move: the page X-rays itself.
 *
 * A live, scaled replica of this page's own hero separates into five planes:
 * surface, components, structured data, delivery and speed. Every readout is
 * measured in the visitor's browser just now (telemetry.ts); a metric the
 * browser does not expose is left out, never faked. Scroll drives the whole
 * act through four custom properties on the sticky stage:
 *
 *   --tilt   0 flat → 1 isometric          --sep     0 stacked → 1 separated
 *   --legend 0..1 readouts arrive in turn  --verdict 0..1 the closing line
 *
 * Reduced motion: no pin, no scrub; the planes sit already separated with
 * every readout visible.
 */
export default function XRay() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const telemetry = usePageTelemetry(near);

  // Measure once the act is within a screen of the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '100% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || reduceMotion) return;
    let frame = 0;

    const ramp = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const write = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      const open = ease(ramp(p, 0.08, 0.38));
      const close = ease(ramp(p, 0.84, 0.97));
      const amount = open * (1 - close);
      stage.style.setProperty('--tilt', amount.toFixed(4));
      stage.style.setProperty('--sep', amount.toFixed(4));
      stage.style.setProperty('--legend', ramp(p, 0.36, 0.78).toFixed(4));
      stage.style.setProperty('--verdict', ease(ramp(p, 0.88, 0.98)).toFixed(4));
      stage.style.setProperty('--intro', (1 - ramp(p, 0.06, 0.24)).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    write();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  const readouts = buildReadouts(telemetry);
  const verdict = verdictLine(telemetry);

  return (
    <section ref={sectionRef} className={styles.xray} aria-labelledby="xray-title" data-static={reduceMotion ? '' : undefined}>
      <div ref={stageRef} className={styles.sticky}>
        <div className={styles.head}>
          <h2 id="xray-title" className={styles.title}>
            {XRAY.title}
          </h2>
          <p className={styles.lede}>{XRAY.lede}</p>
        </div>

        <div className={styles.stage} aria-hidden="true">
          <div className={styles.stack}>
            <div className={styles.plane} data-plane="speed" style={{ '--i': 0 } as React.CSSProperties}>
              <SpeedPlane t={telemetry} />
            </div>
            <div className={styles.plane} data-plane="delivery" style={{ '--i': 1 } as React.CSSProperties}>
              <DeliveryPlane t={telemetry} />
            </div>
            <div className={styles.plane} data-plane="data" style={{ '--i': 2 } as React.CSSProperties}>
              <DataPlane t={telemetry} />
            </div>
            <div className={styles.plane} data-plane="components" style={{ '--i': 3 } as React.CSSProperties}>
              <ComponentsPlane />
            </div>
            <div className={styles.plane} data-plane="surface" style={{ '--i': 4 } as React.CSSProperties}>
              <SurfacePlane />
            </div>
          </div>
        </div>

        <ol className={styles.legend} role="list" aria-label="What this page is made of, measured now">
          {XRAY.planes.map((plane, i) => (
            <li key={plane.id} className={styles.legendItem} style={{ '--k': i } as React.CSSProperties}>
              <span className={styles.legendName}>{plane.name}</span>
              <span className={styles.legendNote}>{plane.note}</span>
              <span className={styles.legendValue}>{readouts[plane.id] ?? 'Measuring…'}</span>
            </li>
          ))}
        </ol>

        {/* No live region: the legend above is the accessible record, so the line
            settling as telemetry arrives never interrupts a screen reader. */}
        <p className={styles.verdict}>{verdict}</p>
      </div>
    </section>
  );
}

function buildReadouts(t: Telemetry): Record<string, string | null> {
  const join = (parts: (string | null | false)[]) => parts.filter(Boolean).join(' · ') || null;
  return {
    surface: join([t.h1Count != null && `${t.h1Count} H1`, t.imageCount != null && `${t.imageCount} images`, 'server-rendered HTML']),
    components: `${XRAY.components.length} components, all ours`,
    data: t.schemaTypes.length
      ? join([`${t.schemaTypes.length} schema.org types`, t.faqCount != null && `${t.faqCount} FAQ answers`])
      : null,
    delivery: join([
      t.requests != null && `${t.requests} requests`,
      formatKb(t.transferBytes) && `${formatKb(t.transferBytes)} transferred`,
      t.edge && `edge: ${t.edge}`,
    ]),
    speed: join([
      t.ttfb != null && `first byte ${Math.round(t.ttfb)} ms`,
      formatSeconds(t.lcp) ? `largest paint ${formatSeconds(t.lcp)}` : formatSeconds(t.fcp) && `first paint ${formatSeconds(t.fcp)}`,
      t.cls != null && `layout shift ${t.cls.toFixed(2)}`,
    ]),
  };
}

function verdictLine(t: Telemetry): string {
  const lcp = formatSeconds(t.lcp);
  if (lcp) return `This page reached you in ${lcp}. We build every site like this.`;
  const fcp = formatSeconds(t.fcp);
  if (fcp) return `This page started painting for you in ${fcp}. We build every site like this.`;
  return 'Every number above was measured on your device. We build every site like this.';
}

/* --------------------------------------------------------------- planes */

function SurfacePlane() {
  return (
    <div className={styles.surface}>
      <Image src={towerDesktop} alt="" fill sizes="(min-width: 1024px) 640px, 80vw" className={styles.surfaceImg} />
      <div className={styles.surfaceBar}>
        <span className={styles.surfaceLogo}>MAPL TECH</span>
        <span className={styles.surfaceCta}>Price your project</span>
      </div>
      <p className={styles.surfaceTitle}>
        {HERO.titleLines[0]} <em>{HERO.titleLines[1]}</em>
      </p>
    </div>
  );
}

function ComponentsPlane() {
  return (
    <div className={styles.components}>
      <span className={styles.box} style={{ left: '3%', top: '4%', width: '94%', height: '11%' }}>
        {'<Header />'}
      </span>
      <span className={styles.box} style={{ left: '3%', top: '20%', width: '52%', height: '42%' }}>
        {'<Hero />'}
      </span>
      <span className={styles.box} style={{ left: '58%', top: '20%', width: '39%', height: '42%' }}>
        {'<DepthScene />'}
      </span>
      <span className={styles.box} style={{ left: '3%', top: '67%', width: '30%', height: '12%' }}>
        {'<Cta />'}
      </span>
      <span className={styles.box} style={{ left: '3%', top: '83%', width: '94%', height: '12%' }}>
        {'<ProofStrip />'}
      </span>
    </div>
  );
}

function DataPlane({ t }: { t: Telemetry }) {
  const types = t.schemaTypes.slice(0, 7);
  return (
    <div className={styles.data}>
      <span className={styles.dataLine}>{'{'}</span>
      <span className={styles.dataLine}>&nbsp;&nbsp;&quot;@context&quot;: &quot;https://schema.org&quot;,</span>
      <span className={styles.dataLine}>&nbsp;&nbsp;&quot;@graph&quot;: [</span>
      {(types.length ? types : ['…']).map((type) => (
        <span key={type} className={styles.dataLine}>
          &nbsp;&nbsp;&nbsp;&nbsp;{'{ "@type": '}
          <b>&quot;{type}&quot;</b>
          {' },'}
        </span>
      ))}
      <span className={styles.dataLine}>&nbsp;&nbsp;]</span>
      <span className={styles.dataLine}>{'}'}</span>
    </div>
  );
}

function DeliveryPlane({ t }: { t: Telemetry }) {
  // Bars are this visit's real resource timings, in request order.
  return (
    <div className={styles.delivery}>
      {t.waterfall.map((bar, i) => (
        <span key={i} className={styles.bar}>
          <span className={styles.barName}>{bar.name}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ left: `${bar.start}%`, width: `${bar.width}%` }} />
          </span>
        </span>
      ))}
    </div>
  );
}

function SpeedPlane({ t }: { t: Telemetry }) {
  const lcp = formatSeconds(t.lcp) ?? formatSeconds(t.fcp);
  return (
    <div className={styles.speed}>
      <span className={styles.speedBig}>{lcp ?? '·'}</span>
      <span className={styles.speedLabel}>{t.lcp != null ? 'largest contentful paint' : 'first contentful paint'}</span>
      <span className={styles.speedRow}>
        {t.ttfb != null && <span>TTFB {Math.round(t.ttfb)} ms</span>}
        {t.cls != null && <span>CLS {t.cls.toFixed(2)}</span>}
      </span>
    </div>
  );
}
