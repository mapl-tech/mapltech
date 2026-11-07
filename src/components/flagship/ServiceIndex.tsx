'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LAYERS, SERVICES_INTRO, SERVICE_PREVIEWS } from './content';
import styles from './ServiceIndex.module.scss';
import Arrow from '@/components/ui/Arrow';

/** The cloud row has no screenshot to show; its preview is how an update goes live (PipelineDiagram's stages). */
const PIPELINE = ['Change', 'Tests', 'Preview', 'Review', 'Live', 'Monitoring'] as const;

/**
 * The four service lines as an index on paper. With a mouse, a
 * preview of real work for the hovered row trails the cursor (eased in a
 * rAF loop, transform only); on touch each row simply carries its summary.
 * Rows are plain links, so keyboard focus shows the same preview.
 */
export default function ServiceIndex() {
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!query.matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let placed = false;

    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      preview.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (event: PointerEvent) => {
      const rect = list.getBoundingClientRect();
      targetX = event.clientX - rect.left + 28;
      targetY = event.clientY - rect.top - preview.offsetHeight / 2;
      if (!placed) {
        x = targetX;
        y = targetY;
        placed = true;
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      placed = false;
    };
    list.addEventListener('pointermove', onMove, { passive: true });
    list.addEventListener('pointerleave', onLeave);
    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.services} aria-labelledby="services-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{SERVICES_INTRO.label}</p>
          <h2 id="services-title" className={styles.title}>
            {SERVICES_INTRO.title}
          </h2>
          {/* The rows each open a service; the estimator prices one or several at once. */}
          <p className={styles.lede}>
            {SERVICES_INTRO.lede}{' '}
            <Link href={SERVICES_INTRO.estimate.href} className={styles.ledeLink} data-cta-placement="home_services_estimate">
              {SERVICES_INTRO.estimate.label}
              <span aria-hidden="true" className={styles.ledeArrow}>
                {'\u00a0'}<Arrow />
              </span>
            </Link>
          </p>
        </header>

        <div className={styles.body}>
          <ol ref={listRef} className={styles.rows} onPointerLeave={() => setActive(null)}>
            {LAYERS.map((layer, i) => (
              <li key={layer.id} className={styles.row} data-active={active === i ? '' : undefined}>
                {/* Named by what it shows, in the order shown: the service, its summary, its price (WCAG 2.5.3,
                    label in name; Nov 7, 2026: the name was the service and price only, without the summary between). */}
                <Link
                  href={layer.href}
                  className={styles.link}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  data-cta-placement={`home_services_${layer.service}`}
                >
                  <span className={styles.name}>{layer.name}</span>
                  <span className={styles.summary}>{layer.summary}</span>
                  <span className={styles.meta}>{layer.fromPrice}</span>
                  <span className={styles.go} aria-hidden="true">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div ref={previewRef} className={styles.preview} data-on={active !== null ? '' : undefined} aria-hidden="true">
            {LAYERS.map((layer, i) => {
              const shot = SERVICE_PREVIEWS[layer.service];
              return (
                <div key={layer.id} className={styles.frame} data-shown={active === i ? '' : undefined}>
                  {shot ? (
                    <Image src={shot.src} alt="" width={shot.width} height={shot.height} sizes="420px" className={styles.shot} />
                  ) : (
                    <ol className={styles.pipeline}>
                      {PIPELINE.map((stage) => (
                        <li key={stage}>{stage}</li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
