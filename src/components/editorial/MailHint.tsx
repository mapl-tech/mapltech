/**
 * Read with an email link's name: it opens the mail app, not a page (the
 * site's "opens in a new tab" pattern). One wording for every email link: the
 * legal pages' requests and questions, and the 404's broken-link report. No
 * hooks, so server pages and client islands share it.
 */
export default function MailHint() {
  return <span className="visually-hidden"> (opens your email app)</span>;
}
