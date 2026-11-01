import type { ReactNode } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { telHref } from '@/components/layout/chrome';
import ArticleToc from './ArticleToc';
import TocDisclosure from './TocDisclosure';
import styles from './Legal.module.scss';

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface LegalFact {
  label: string;
  text: string;
  /** Section id the fact is taken from. */
  section: string;
}

export interface LegalDocumentProps {
  title: string;
  intro: string;
  lastUpdated: { iso: string; label: string };
  facts: readonly LegalFact[];
  sections: readonly LegalSection[];
  /** "Questions about this policy?" */
  questions: string;
  mailSubject: string;
  sibling: { label: string; href: string };
  /**
   * The reader's main task on this page, if there is one (privacy: using a
   * right). Becomes the closing aside's primary action, and the email address
   * in the summary links to it.
   */
  action?: { label: string; subject: string; section: string; rights: string };
}

function mailto(subject: string): string {
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
}

/** The summary's email address, as a link (same text, now one tap). */
function withEmailLink(text: string, subject: string): ReactNode {
  const at = text.indexOf(siteConfig.email);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <a href={mailto(subject)} className={styles.factMail}>
        {siteConfig.email}
      </a>
      {text.slice(at + siteConfig.email.length)}
    </>
  );
}

/**
 * Privacy policy and terms of use (flagship redesign). Legal pages get landed
 * on directly, so they open like a landing page: a plain intro, the last
 * updated date, and "The short version", a list of facts the document itself
 * states, each linked to the section it comes from. Every section is then in
 * the HTML in full (no accordions), numbered, anchored and listed in a sticky
 * contents rail. The legal wording is unchanged.
 */
export default function LegalDocument({
  title,
  intro,
  lastUpdated,
  facts,
  sections,
  questions,
  action,
  mailSubject,
  sibling,
}: LegalDocumentProps) {
  const toc = sections.map((section) => ({ id: section.id, text: section.title }));
  const number = (id: string) => sections.findIndex((section) => section.id === id) + 1;

  return (
    <article className={styles.legal} aria-labelledby="legal-title">
      <header className={styles.hero}>
        <div className={styles.grid}>
          <div className={styles.heroRail}>
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-current="page">{title}</li>
              </ol>
            </nav>
          </div>
          <div className={styles.heroMain}>
            <h1 id="legal-title" className={styles.title}>
              {title}
            </h1>
            <p className={styles.intro}>{intro}</p>
            <p className={styles.meta}>
              <span>
                Last updated <time dateTime={lastUpdated.iso}>{lastUpdated.label}</time>
              </span>
              <span>{sections.length} sections</span>
            </p>
          </div>
        </div>
      </header>

      <div className={`${styles.grid} ${styles.body}`}>
        <div className={styles.bodyRail}>
          <ArticleToc items={toc} bodyId="legal-body" label="On this page" numbered />
        </div>

        <div className={styles.bodyMain}>
          <section className={styles.facts} aria-labelledby="facts-title">
            <h2 id="facts-title" className={styles.factsTitle}>
              The short version
            </h2>
            <p className={styles.factsNote}>What the sections below say, in brief. The full text is what applies.</p>
            <dl className={styles.factList}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>
                    {withEmailLink(fact.text, action ? action.subject : mailSubject)}{' '}
                    <a href={`#${fact.section}`} className={styles.factLink}>
                      Section {number(fact.section)}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <TocDisclosure items={toc} label="On this page" />

          <div id="legal-body" className={styles.sections}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{index + 1}</span>
                  {section.title}
                </h2>
                <div className={styles.prose}>{section.content}</div>
              </section>
            ))}
          </div>

          <aside className={styles.questions} aria-labelledby="questions-title">
            <h2 id="questions-title" className={styles.questionsTitle}>
              {questions}
            </h2>
            {action ? (
              <p className={styles.questionsText}>
                To use a right from <a href={`#${action.section}`}>section {number(action.section)}</a> ({action.rights}),
                email us and say which one. Anything else: <a href={mailto(mailSubject)}>{siteConfig.email}</a> or{' '}
                <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>. Our Toronto office keeps 09:00 to 18:00
                Eastern time, Monday to Friday.
              </p>
            ) : (
              <p className={styles.questionsText}>
                Email <a href={mailto(mailSubject)}>{siteConfig.email}</a> or call{' '}
                <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>. Our Toronto office keeps 09:00 to 18:00
                Eastern time, Monday to Friday.
              </p>
            )}
            <p className={styles.questionsActions}>
              <a href={mailto(action ? action.subject : mailSubject)} className={styles.secondary}>
                {action ? action.label : 'Email your question'}
              </a>
              <Link href={sibling.href} className={styles.textLink}>
                {sibling.label}
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </article>
  );
}
