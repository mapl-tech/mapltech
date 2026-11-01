'use client';

import { useEffect } from 'react';
import { useEstimateState } from './estimateUrlStore';

/**
 * One island for every "Your estimate" tag in the price list. The tags are
 * server-rendered `hidden` with a `data-match="<service>:<tierIndex>"` key;
 * once the visitor has an estimate of their own (answers or a shared link),
 * this reveals the rows it landed on and hides the rest. Renders nothing.
 */
export default function MatchedTiers() {
  const { result, touched } = useEstimateState();

  useEffect(() => {
    const keys = new Set(touched ? result.lines.map((line) => `${line.service}:${line.tierIndex}`) : []);
    document.querySelectorAll<HTMLElement>('[data-match]').forEach((tag) => {
      tag.hidden = !keys.has(tag.dataset.match ?? '');
    });
  }, [result, touched]);

  return null;
}
