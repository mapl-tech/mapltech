import Accordion from '@/components/ui/Accordion';
import Arrow from '@/components/ui/Arrow';
import { keepTogether } from '@/components/services/keepTogether';
import BookButton from './BookButton';
import { FAQ, FAQ_HEAD, type FaqAction } from './content';
import styles from './Bio.module.scss';

/**
 * The questions people ask before they book (Leshan, Nov 20, 2026: "update
 * the FAQ section on the bio page, it looks plain").
 *
 * - Desktop: the site's FAQ layout (the homepage's 5/7 split). The heading,
 *   its lede and the ask stay in view (sticky) beside the answers, so the
 *   decision sits next to the objection it settles; the line under the button
 *   answers effort and speed at the click.
 * - Phones and tablets: heading, lede, then the list. No ask in the head: the
 *   close band follows the list, and the sticky bar is on screen.
 * - Rows are numbered (Accordion `numbered`), the first one open. Each answer
 *   leads with its bottom line in bold, then the detail, then its next step
 *   where it has one (the public prices). The call request itself is only
 *   ever the ask beside the list, so one action has one look.
 */
function Action({ action }: { action: FaqAction }) {
  return (
    <a href={action.href} className={styles.faqAction} data-cta-placement={action.placement}>
      {action.label}
      <span aria-hidden="true" className={styles.faqActionArrow}>
        <Arrow />
      </span>
    </a>
  );
}

export default function BioFaq() {
  return (
    <div className={styles.faqLayout}>
      <div className={styles.faqHead}>
        <h2 id="bio-faq" className={styles.h2}>
          {FAQ_HEAD.title}
        </h2>
        <p className={styles.sectionLede}>{keepTogether(FAQ_HEAD.lede)}</p>
        <div className={styles.faqAsk}>
          <BookButton placement="bio_faq" className={styles.primary} arrowClassName={styles.arrow} />
          <p className={styles.faqAskNote}>{keepTogether(FAQ_HEAD.askNote)}</p>
        </div>
      </div>

      <Accordion
        name="bio-faq"
        numbered
        defaultOpen={0}
        className={styles.faqList}
        items={FAQ.map((item, i) => ({
          id: `faq-${i + 1}`,
          question: item.question,
          answer: (
            <>
              <p className={styles.faqAnswer}>
                <strong className={styles.faqLead}>{keepTogether(item.lead)}</strong> {keepTogether(item.detail)}
              </p>
              {item.action ? (
                <p className={styles.faqNext}>
                  <Action action={item.action} />
                </p>
              ) : null}
            </>
          ),
        }))}
      />
    </div>
  );
}
