import type { ReactNode } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import PageHeader from '@/components/ui/PageHeader';
import ArticleToc from './ArticleToc';
import MailHint from './MailHint';
import TocDisclosure from './TocDisclosure';
import styles from './Legal.module.scss';
import Arrow from '@/components/ui/Arrow';

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
   * right). Becomes the hero's action and the closing panel's primary action,
   * and the email address in the summary links to it.
   */
  action?: { label: string; subject: string; section: string; rights: string };
}

function mailto(subject: string, body?: string): string {
  const query = `subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
  return `mailto:${siteConfig.email}?${query}`;
}

/**
 * A neutral prompt in the email body: what to put in it, nothing promised.
 * A request names the right (in the policy's own list); a question just
 * leaves room for it. Lines end in CRLF, as mailto bodies should (RFC 6068).
 */
function mailBody(rights?: string): string {
  const lines = rights
    ? [`Request (${rights}):`, '', '', 'Name:', 'Email address used with MAPL TECH:']
    : ['Question:', '', '', 'Name:'];
  return `${lines.join('\r\n')}\r\n`;
}

/**
 * Every email route on a legal page: the subject, and the body prompt (a
 * request names its rights). The pages use it for the links inside their own
 * text too, so the wording stays as written while every link opens the same way.
 */
export function legalMailto(subject: string, rights?: string): string {
  return mailto(subject, mailBody(rights));
}

/** The summary's email address, as a link (same text, now one tap). */
function withEmailLink(text: string, href: string): ReactNode {
  const at = text.indexOf(siteConfig.email);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <a href={href} className={styles.factMail}>
        {siteConfig.email}
      </a>
      {text.slice(at + siteConfig.email.length)}
    </>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The ask on a page without a request of its own (terms): the closing button and the phone bar. */
const QUESTION_LABEL = 'Email your question';

/**
 * The second way to ask: the contact page's "Talk to us" section (email,
 * phone and hours), never the four-step project brief above it, so a legal
 * page makes no sales ask.
 */
const TALK_HREF = '/contact-us#direct-title';

/**
 * Privacy policy and terms of use (Nov 2026 award pass). Legal pages get
 * landed on directly, so they open like a landing page: the page hero with the
 * last-updated date and a way to ask, then the document itself on paper. It
 * starts with "The short version", facts the document itself states, each
 * linked to its section; then every section in full (no accordions),
 * numbered, anchored and listed in a sticky contents rail (phones and
 * tablets: a contents disclosure above the short version, so it is in reach
 * at the top of the document). The page's task, when it has one, is the
 * phone bar's action too (`data-hero-cta` on the hero's email link); without
 * one (terms) the bar offers the hero's question address under the closing
 * button's words, so it never puts a sales ask on a legal page. Each way
 * to ask has a second route, a call (the contact page's "Talk to us", never
 * the project brief: no sales ask on a legal page), and every email opens with a
 * neutral prompt in its body. The request looks the same wherever it is a
 * button (the hero, the closing panel), and says it opens the email app. The
 * closing panel is the page's close (`data-page-close`: the phone bar stands
 * down beside it and the footer drops its own ask), with the sibling document
 * and the way back into the site; it points to the ways to ask without
 * repeating the address and number the last section has just given. A link
 * to a section is named for it ("section 8, Your rights"), on screen and on
 * paper. Printed, the document is ink on white with the site chrome, the
 * contents and the buttons left out, and each page link's address printed
 * after it. The legal wording is unchanged.
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
  const titleOf = (id: string) => sections.find((section) => section.id === id)?.title ?? '';
  // One request link everywhere it appears (hero, summary, closing panel), and one for questions.
  const requestHref = action ? legalMailto(action.subject, action.rights) : null;
  const questionHref = legalMailto(mailSubject);

  return (
    <article className={styles.legal} aria-labelledby="legal-title">
      <PageHeader
        id="legal-title"
        size="l"
        crumbs={[{ label: 'Home', href: '/' }, { label: title }]}
        label="Legal"
        title={title}
        lede={intro}
        actions={
          action && requestHref ? (
            <>
              {/* The phone bar repeats this action under its label alone (data-bar-label). */}
              <a href={requestHref} className={styles.requestButton} data-hero-cta="" data-bar-label={action.label}>
                {action.label}
                <MailHint />
              </a>
              <Link href={TALK_HREF} className={styles.heroLink} data-cta-placement="legal_hero_call">
                Or call us
              </Link>
            </>
          ) : undefined
        }
        aside={
          <dl className={styles.heroFacts}>
            <div>
              <dt>Last updated</dt>
              <dd>
                <time dateTime={lastUpdated.iso}>{lastUpdated.label}</time>
              </dd>
            </div>
            <div>
              <dt>Questions</dt>
              <dd>
                {/* No request of its own (terms): this address is the page's ask, and the
                    phone bar repeats it under the closing button's words. */}
                <a
                  href={questionHref}
                  data-hero-cta={action ? undefined : ''}
                  data-bar-label={action ? undefined : QUESTION_LABEL}
                >
                  {siteConfig.email}
                </a>
              </dd>
            </div>
          </dl>
        }
      />

      {/* ---------------------------------------------------------- the document, on paper */}
      <div className={styles.doc}>
        <div className={styles.docGrid}>
          <div className={styles.rail}>
            <ArticleToc items={toc} bodyId="legal-body" label="On this page" tone="paper" />
          </div>

          <div className={styles.main}>
            <TocDisclosure items={toc} label="On this page" tone="paper" />

            <section className={styles.summary} aria-labelledby="facts-title">
              <h2 id="facts-title" className={styles.summaryTitle}>
                The short version
              </h2>
              <p className={styles.summaryNote}>A short summary of each section. The full text below is what applies.</p>
              <dl className={styles.factList}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt>{fact.label}</dt>
                    <dd>
                      {withEmailLink(fact.text, requestHref ?? questionHref)}{' '}
                      {/* Named for where it goes: "Section 2: Information we collect". */}
                      <a href={`#${fact.section}`} className={styles.factLink}>
                        Section&nbsp;{number(fact.section)}: {titleOf(fact.section)}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <div id="legal-body" className={styles.sections}>
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {/* Decoration: the heading reads "Introduction", not "01Introduction". */}
                    <span className={styles.sectionNumber} aria-hidden="true">
                      {pad(index + 1)}
                    </span>
                    {section.title}
                  </h2>
                  <div className={styles.prose}>{section.content}</div>
                </section>
              ))}
            </div>

            {/* The page's close: the phone bar stands down beside it and the footer drops its ask. */}
            <aside className={styles.questions} aria-labelledby="questions-title" data-page-close="">
              <h2 id="questions-title" className={styles.questionsTitle}>
                {questions}
              </h2>
              {/* The address and number are in the last section, just above: this says which way to ask.
                  The section link carries its name ("section 8, Your rights"), so it reads the same on paper. */}
              {action ? (
                <p className={styles.questionsText}>
                  Email us to use a right from{' '}
                  <a href={`#${action.section}`}>
                    section&nbsp;{number(action.section)}, {titleOf(action.section)}
                  </a>
                  : {action.rights}. Say which one, or <Link href={TALK_HREF}>call us</Link>. Our Toronto office
                  is open 9&nbsp;am to 6&nbsp;pm Eastern time, Monday to Friday.
                </p>
              ) : (
                <p className={styles.questionsText}>
                  Email us, or <Link href={TALK_HREF}>call us</Link>. Our Toronto office is open 9&nbsp;am to
                  6&nbsp;pm Eastern time, Monday to Friday.
                </p>
              )}
              {/* data-header-quiet: while this filled ask is on screen the header's steps back to an outline. */}
              <p className={styles.questionsActions} data-header-quiet="">
                <a href={requestHref ?? questionHref} className={styles.requestButton}>
                  {action ? action.label : QUESTION_LABEL}
                  <MailHint />
                </a>
                <Link href={sibling.href} className={styles.textLink}>
                  {sibling.label}
                  <Arrow />
                </Link>
                <Link href="/" className={styles.textLink}>
                  Back to the homepage
                  <Arrow />
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
