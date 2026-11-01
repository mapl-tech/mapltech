'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Cta from '@/components/home/Cta';
import type { JobView } from './serviceContent';
import styles from './JobPicker.module.scss';

interface Group {
  service: string;
  name: string;
}

/** "Published range" → "published range" for use mid-sentence (service names keep their capitals). */
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * The index's one interaction: start from the job, not the jargon. Eight
 * jobs agencies are asked for, grouped by layer, each with its tier and
 * public price already visible (nothing to reveal, nothing gated). Picking
 * one restates the layer, tier, price, timeline (web) and what it includes,
 * and points "Price your project" at the estimator with that service and tier
 * already selected. The first job is the default so the answer and the link
 * are complete in the server HTML; picking never navigates on its own.
 *
 * One answer element, two layouts: a sticky card beside the options on wide
 * screens, a sticky bar at the bottom of the form on phones (the site's own
 * action bar steps aside while a form is in view). Anything that is neither
 * listed nor one layer goes to a call.
 */
export default function JobPicker({
  jobs,
  groups,
  head,
}: {
  jobs: readonly JobView[];
  groups: readonly Group[];
  head: ReactNode;
}) {
  const uid = useId();
  const [selectedId, setSelectedId] = useState(jobs[0]?.id);
  const job = jobs.find((j) => j.id === selectedId) ?? jobs[0];
  if (!job) return null;

  return (
    <form className={styles.picker} aria-labelledby="jobs-title" onSubmit={(event) => event.preventDefault()}>
      <div className={styles.head}>{head}</div>

      <fieldset className={styles.options}>
        <legend className={styles.legend}>Pick the job closest to yours</legend>
        <div className={styles.optionsBody}>
          {groups.map((group) => (
            <div key={group.service} role="group" aria-labelledby={`${uid}-${group.service}`} className={styles.group}>
              <p id={`${uid}-${group.service}`} className={styles.groupName}>
                {group.name}
              </p>
              <div className={styles.groupOptions}>
                {jobs
                  .filter((j) => j.service === group.service)
                  .map((j) => (
                    <label key={j.id} className={styles.option} data-on={j.id === job.id ? '' : undefined}>
                      <input
                        type="radio"
                        className={styles.radio}
                        name={`${uid}-job`}
                        value={j.id}
                        checked={j.id === job.id}
                        onChange={() => setSelectedId(j.id)}
                      />
                      <span className={styles.optionLabel}>
                        {j.label}
                        <span className="visually-hidden">.</span>
                      </span>
                      <span className={styles.optionMeta}>
                        <span>
                          {j.tierName}
                          <span className="visually-hidden">,</span>
                        </span>
                        <span className={styles.optionPrice}>{j.price}</span>
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
          <p className={styles.notListed}>
            Not on the list, or more than one layer?{' '}
            <Link href="/contact-us" className={styles.inlineLink} data-cta-placement="services_job_call">
              Book a call
            </Link>{' '}
            and we scope it with you.
          </p>
        </div>
      </fieldset>

      <div className={styles.answer}>
        <span className={styles.answerFrame} aria-hidden="true" />
        <div className={styles.answerBody}>
          <p className={`${styles.cardLabel} ${styles.wideOnly}`}>Your starting point</p>
          <p className={styles.cardService}>
            <span className={styles.cardServiceName}>{job.serviceName}</span>
            <span className={styles.cardTier}>{job.tierName}</span>
          </p>
          {/* Re-keyed so each new answer settles in. */}
          <p key={job.id} className={styles.cardPrice}>
            {job.price}
          </p>
          <p className={`${styles.cardNote} ${styles.wideOnly}`}>
            {job.priceNote}
            {job.timeline ? ` · typically ${job.timeline}` : ''}
          </p>
          <ul className={`${styles.cardIncludes} ${styles.wideOnly}`} role="list">
            {job.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className={styles.cardActions}>
            {/* The same CTA component and size as the hero and the close: one action, one look. */}
            <Cta placement={`services_job_${job.id}`} href={job.href} size="large" boxClassName={styles.primaryBox}>
              Price your project
            </Cta>
            <Link href={job.servicePath} className={`${styles.textLink} ${styles.wideOnly}`}>
              {job.serviceName}: how we build it
              <span aria-hidden="true">&nbsp;→</span>
            </Link>
          </div>
          {/* One polite sentence per change, so a screen reader hears the answer once. */}
          <p className="visually-hidden" aria-live="polite" aria-atomic="true">
            {`${job.tierName}, ${job.serviceName}: ${job.price}, ${lower(job.priceNote)}${job.timeline ? `, typically ${job.timeline}` : ''}.`}
          </p>
        </div>
      </div>
    </form>
  );
}
