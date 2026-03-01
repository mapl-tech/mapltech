'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollOrb from './ScrollOrb';
import styles from './PersistentOrb.module.scss';

export interface OrbSectionConfig {
  sectionId: string;
  variant: 'red' | 'teal' | 'mixed';
  scale: number;
  opacity: number;
  rotationMultiplier: number;
}

interface PersistentOrbProps {
  sections: OrbSectionConfig[];
  defaultVariant?: 'red' | 'teal' | 'mixed';
}

export default function PersistentOrb({
  sections,
  defaultVariant = 'red',
}: PersistentOrbProps) {
  const [activeConfig, setActiveConfig] = useState<OrbSectionConfig>(
    sections[0] ?? {
      sectionId: 'default',
      variant: defaultVariant,
      scale: 1,
      opacity: 0.9,
      rotationMultiplier: 1,
    }
  );

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionElements = sections
      .map((s) => document.querySelector(`[data-orb-section="${s.sectionId}"]`))
      .filter(Boolean) as Element[];

    if (sectionElements.length === 0) return;

    const configMap = new Map(sections.map((s) => [s.sectionId, s]));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio)
          ) {
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const id = (bestEntry.target as HTMLElement).dataset.orbSection;
          if (id && configMap.has(id)) {
            setActiveConfig(configMap.get(id)!);
          }
        }
      },
      { threshold: [0.1, 0.3, 0.5] }
    );

    for (const el of sectionElements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  return (
    <motion.div
      className={styles.orbContainer}
      animate={{
        scale: activeConfig.scale,
        opacity: activeConfig.opacity,
      }}
      transition={{
        type: 'spring',
        stiffness: 60,
        damping: 20,
        mass: 0.8,
      }}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeConfig.variant}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ScrollOrb
            variant={activeConfig.variant}
            rotationMultiplier={activeConfig.rotationMultiplier}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
