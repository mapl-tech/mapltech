import { siteConfig } from '@/config/site';
import { escapeHtml, type EmailAttachment, type OutgoingEmail } from './email';
import { HUBSPOT_FORMS, type CrmResult, type HubSpotForm } from './hubspot';

/**
 * The emails every form sends, in MAPL TECH's look: one to the inbox
 * (contact@mapltech.com) with the entry, and one to the visitor, confirming it
 * arrived and saying what happens next.
 *
 * - One layout for both: the site's dark ground, the logo, a card with the red
 *   rule, Overpass headings over DM Sans, one red button. Every text colour is
 *   7:1 or more against what it sits on (WCAG AAA).
 * - Built for mail apps: tables, inline styles, a 600px column that runs full
 *   width on phones, a button Outlook on Windows draws as well, and the hover,
 *   focus and phone rules in the head (an app that drops the head keeps the
 *   inline look). Every email has a plain-text twin.
 * - The visitor's email never repeats what they typed, apart from a first name
 *   that is plainly a name, so nobody can use a form to put their own words in
 *   someone else's inbox from mapltech.com.
 * - The visitor's copy keeps to what each form already promises on the page.
 */

/** The site's own colours (src/styles/_variables.scss). */
const COLOR = {
  ground: '#0a0a0a',
  card: '#111111',
  line: '#222222',
  raised: '#1c1c1c',
  /** The red: rules only, never text. */
  rule: '#F03350',
  /** 16.9:1 on the card. */
  fg: '#F5F2EE',
  /** 10.8:1 on the card. */
  body: '#C6C4C0',
  /** 8.9:1 on the card, 9.4:1 on the ground. */
  muted: '#B4B2AF',
  /** 8.0:1 on the card. */
  link: '#FF8397',
  /** The button's fill: white on it is 7.56:1. */
  fill: '#A51832',
  fillHover: '#8F162C',
  fillPressed: '#7A1226',
} as const;

const SANS = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const DISPLAY = "Overpass,'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const SITE = siteConfig.url;
const INBOX = siteConfig.email;

/** The visitor's emails come from MAPL TECH itself, and a reply reaches the inbox. */
export const VISITOR_FROM = `MAPL TECH <${INBOX}>`;

/** public/email/mapl-tech-logo.png (scripts/email-logo.mjs): the white mark on the ground, drawn at 3x. */
const LOGO = { src: `${SITE}/email/mapl-tech-logo.png`, width: 148, height: 33 };

export interface Row {
  label: string;
  value: string;
  href?: string;
}

/** What the visitor's email may know about them. */
interface Visitor {
  /** The greeting's first name, '' when the name is not plainly one. */
  first: string;
  /** The brief's visitor asked for a call. */
  phone: boolean;
  /** A resume came with the careers form. */
  resume: boolean;
  /** The address the email goes to. */
  email: string;
}

interface FormCopy {
  /** The form's name, as both emails say it. */
  label: string;
  /** Where the form is. */
  where: string;
  /** The inbox email's heading. */
  inbox: (who: string) => string;
  /** What the visitor was promised, repeated to the team. */
  promise?: string;
  subject: string;
  preheader: string;
  heading: (visitor: Visitor) => string;
  lead: (visitor: Visitor) => string;
  /** What happens next, in order. */
  steps?: (visitor: Visitor) => string[];
  /** How to add something: a reply reaches the inbox. */
  more: string;
  /** The one optional next step. */
  cta: { intro: string; label: string; href: string };
  /** Why the visitor got the email. */
  reason: string;
}

const WORK = { intro: 'While you wait, you can see some of our recent work.', label: 'See the work', href: `${SITE}/our-work` };
const CALL = 'We talk for 20 minutes and agree the scope with you.';
const QUOTE = 'You get a fixed quote.';
const ADD = 'Want to add something, like a link or a file? Reply to this email and it comes straight to us.';
const SALES_PROMISE = 'They were told we reply within 24 hours.';
const SALES_PREHEADER = 'We reply within 24 hours. Then a 20-minute call and a fixed quote.';
/** The brief's own words on the page once it is sent. */
const IN_INBOX = `It’s in our inbox at ${INBOX}.`;
/** Every visitor email is signed by the people who will reply. */
const SIGN_OFF = 'The MAPL TECH team';

const thanks = (first: string, rest: string) => (first ? `Thanks, ${first}. ${rest}` : `Thanks. ${rest}`);

function regional(country: string, slug: string): FormCopy {
  return {
    label: `${country} inquiry`,
    where: `mapltech.com/${slug}`,
    inbox: (who) => `${who} sent an inquiry from the ${country} page`,
    promise: SALES_PROMISE,
    subject: 'We have your inquiry',
    preheader: SALES_PREHEADER,
    heading: ({ first }) => thanks(first, 'We have your inquiry.'),
    lead: () => IN_INBOX,
    steps: () => ['We reply by email within 24 hours.', CALL, QUOTE],
    more: ADD,
    cta: WORK,
    reason: `You’re getting this email because you sent an inquiry on mapltech.com/${slug}.`,
  };
}

/** Every form's words, for the inbox and for the visitor. */
export const FORM_COPY: Record<HubSpotForm, FormCopy> = {
  project_brief: {
    label: 'Project brief',
    where: 'mapltech.com/contact-us',
    inbox: (who) => `${who} sent a project brief`,
    promise: SALES_PROMISE,
    subject: 'We have your brief',
    preheader: SALES_PREHEADER,
    heading: ({ first }) => thanks(first, 'We have your brief.'),
    lead: () => IN_INBOX,
    steps: ({ phone }) => [phone ? 'We call you within 24 hours.' : 'We reply by email within 24 hours.', CALL, QUOTE],
    more: ADD,
    cta: WORK,
    reason: 'You’re getting this email because you sent a project brief on mapltech.com.',
  },
  referral: {
    label: 'Referral',
    where: 'mapltech.com/referral',
    inbox: (who) => `${who} referred an agency`,
    subject: 'Thanks for the referral',
    preheader: 'We will contact them and mention that you introduced them.',
    heading: ({ first }) => thanks(first, 'Referral received.'),
    lead: () => 'We will contact them and mention that you introduced them.',
    more: 'Want to tell us more about them? Reply to this email and it comes straight to us.',
    cta: { intro: 'Have a project of your own?', label: 'Start a project', href: `${SITE}/contact-us` },
    reason: 'You’re getting this email because you sent a referral on mapltech.com.',
  },
  estimate_email: {
    label: 'Estimate request',
    where: 'mapltech.com/pricing',
    inbox: (who) => `${who} asked for an estimate in writing`,
    promise: 'They were told we reply within 24 hours, with the estimate in writing.',
    subject: 'We have your estimate request',
    preheader: 'We reply within 24 hours, with the estimate in writing.',
    heading: () => 'We have your estimate request.',
    lead: () => IN_INBOX,
    steps: () => ['We reply within 24 hours, with the estimate in writing.', CALL, QUOTE],
    more: ADD,
    cta: WORK,
    reason: 'You’re getting this email because you asked for an estimate on mapltech.com.',
  },
  regional_inquiry_nigeria: regional('Nigeria', 'nigeria'),
  regional_inquiry_jamaica: regional('Jamaica', 'jamaica'),
  bio_call_request: {
    label: 'Call request',
    where: 'bio.mapltech.com',
    inbox: (who) => `${who} asked for a call`,
    promise: 'They were told we email them within 24 hours to set a time for the 20-minute call.',
    subject: 'Your call request is in',
    preheader: 'We’ll email you within 24 hours to set a time for your 20-minute call.',
    heading: ({ first }) => thanks(first, 'Your call request is in.'),
    lead: () => IN_INBOX,
    steps: () => ['We email you within 24 hours to set a time.', 'We talk for 20 minutes.', 'You get one fixed price and an agreed launch date.'],
    more: 'Want to add something before the call? Reply to this email and it comes straight to us.',
    cta: WORK,
    reason: 'You’re getting this email because you asked for a call on bio.mapltech.com.',
  },
  careers_application: {
    label: 'Job application',
    where: 'mapltech.com/careers',
    inbox: (who) => `${who} applied for a job`,
    promise: 'They were told we read every application and reply by email.',
    subject: 'We have your application',
    preheader: 'We read every application and reply by email.',
    heading: ({ first }) => (first ? `Thanks for applying, ${first}.` : 'Thanks for applying.'),
    lead: ({ resume }) => `Your application${resume ? ' and resume are' : ' is'} with us. We read every application and reply by email.`,
    more: 'Want to add something, like a link to your work? Reply to this email and it comes straight to us.',
    cta: { intro: 'While you wait, you can meet the people you would work with.', label: 'Meet the team', href: `${SITE}/team` },
    reason: 'You’re getting this email because you applied on mapltech.com/careers.',
  },
  talent_list: {
    label: 'Talent list',
    where: 'mapltech.com/careers',
    inbox: (who) => `${who} joined the talent list`,
    subject: 'You’re on the MAPL TECH talent list',
    preheader: 'We’ll be in touch when a matching role opens.',
    heading: ({ first }) => (first ? `You’re on the list, ${first}.` : 'You’re on the list.'),
    lead: ({ resume }) => `We’ll be in touch when a matching role opens${resume ? ', with your resume to hand' : ''}.`,
    more: 'Want to add something, like a link to your work? Reply to this email and it comes straight to us.',
    cta: { intro: 'The roles open now are on our careers page.', label: 'See open roles', href: `${SITE}/careers` },
    reason: 'You’re getting this email because you joined the talent list on mapltech.com/careers.',
  },
  newsletter: {
    label: 'Newsletter',
    where: 'the mapltech.com footer',
    inbox: (who) => `${who} subscribed to the newsletter`,
    subject: 'You’re subscribed to the MAPL TECH newsletter',
    preheader: 'The next issue goes to this address.',
    heading: () => 'You’re subscribed.',
    lead: ({ email }) => `The next issue goes to ${email}.`,
    more: 'Changed your mind? Reply with “unsubscribe” and we’ll take you off the list.',
    cta: { intro: 'Until then, our latest writing is on the blog.', label: 'Read the blog', href: `${SITE}/blog` },
    reason: 'You’re getting this email because this address subscribed on mapltech.com.',
  },
};

/**
 * The first word of a name, when it is plainly a name: letters, with an
 * apostrophe or a hyphen, up to 30. Anything else (a link, a pitch) gets no
 * greeting, so the visitor's email carries nothing a stranger wrote.
 */
export function firstName(name: string | undefined): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return /^\p{L}[\p{L}\p{M}'’-]{0,29}$/u.test(first) ? first : '';
}

/** Cut to `max` characters at a word boundary, with an ellipsis. */
function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max / 2 ? cut.lastIndexOf(' ') : cut.length).trimEnd()}…`;
}

/** A mailto: address with everything but the @ percent-encoded. */
const mailto = (email: string, subject?: string) =>
  `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** Only web and mail links become links in an email; anything else stays text. */
const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

// The parts every email is made of. Each takes escaped HTML or escapes its own words.

const eyebrow = (words: string) =>
  `<p style="margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:20px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.link};">${escapeHtml(words)}</p>`;

const heading = (words: string) =>
  `<h1 class="h1" style="margin:0 0 16px;font-family:${DISPLAY};font-size:28px;line-height:34px;font-weight:800;letter-spacing:-0.01em;color:${COLOR.fg};overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(words)}</h1>`;

const paragraphHtml = (html: string, gap = 16, color: string = COLOR.body) =>
  `<p style="margin:0 0 ${gap}px;font-family:${SANS};font-size:16px;line-height:26px;color:${color};">${html}</p>`;

const paragraph = (words: string, gap = 16, color: string = COLOR.body) => paragraphHtml(escapeHtml(words), gap, color);

/** Words with the inbox address made a link, for a reader who would rather write a fresh email. */
const linkInbox = (words: string) =>
  escapeHtml(words).replace(
    escapeHtml(INBOX),
    `<a class="text-link" href="${mailto(INBOX)}" style="color:${COLOR.link};text-decoration:underline;">${escapeHtml(INBOX)}</a>`,
  );

const label = (words: string) =>
  `<h2 style="margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:20px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.muted};">${escapeHtml(words)}</h2>`;

const steps = (items: string[]) =>
  `${label('What happens next')}<ol class="steps" style="margin:0 0 24px;padding:0 0 0 24px;font-family:${SANS};font-size:16px;line-height:26px;color:${COLOR.fg};">${items
    .map((item, i) => `<li style="margin:0 0 ${i === items.length - 1 ? 0 : 8}px;padding:0 0 0 4px;">${escapeHtml(item)}</li>`)
    .join('')}</ol>`;

/** A hairline between the message and the optional step. */
const rule = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:8px 0 24px;"><div style="height:1px;line-height:1px;font-size:1px;background:${COLOR.line};">&nbsp;</div></td></tr></table>`;

/**
 * The one red button: 48px tall, full width on phones. Outlook on Windows gets
 * the same padded, rounded button drawn in VML.
 */
function button(words: string, href: string): string {
  const vmlWidth = Math.max(176, Math.round(words.length * 9.5 + 64));
  const url = escapeHtml(href);
  const text = escapeHtml(words);
  return `<table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${COLOR.fill}" style="border-radius:8px;background:${COLOR.fill};"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="17%" stroke="f" fillcolor="${COLOR.fill}"><w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${text}</center></v:roundrect><![endif]--><!--[if !mso]><!--><a class="btn-link" href="${url}" style="display:inline-block;padding:13px 28px;border:1px solid ${COLOR.fill};border-radius:8px;background:${COLOR.fill};color:#FFFFFF;font-family:${SANS};font-size:16px;line-height:20px;font-weight:600;text-align:center;text-decoration:none;">${text}</a><!--<![endif]--></td></tr></table>`;
}

/** The entry's answers, each label over its answer, escaped; an answer keeps its line breaks. */
function answers(rows: Row[]): string {
  const value = ({ value: words, href }: Row) => {
    const html = escapeHtml(words).replace(/\r?\n/g, '<br>');
    return href && SAFE_LINK.test(href)
      ? // A link alone on its line: padded to a 44px touch target, still wrapping a long address.
        `<a class="text-link" href="${escapeHtml(href)}" style="display:inline-block;padding:10px 0;margin:-10px 0;color:${COLOR.link};text-decoration:underline;">${html}</a>`
      : html;
  };
  // A list of name and answer, each label over its answer at every width: it needs no
  // phone rule, so an app that drops the head (Gmail with other accounts) shows it the same.
  return `<dl style="margin:0;padding:0;border-top:1px solid ${COLOR.line};">${rows
    .map(
      (row) =>
        `<dt style="margin:0;padding:12px 0 0;font-family:${SANS};font-size:14px;line-height:20px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLOR.muted};">${escapeHtml(row.label)}</dt><dd style="margin:0;padding:4px 0 12px;border-bottom:1px solid ${COLOR.line};font-family:${SANS};font-size:16px;line-height:24px;color:${COLOR.fg};overflow-wrap:anywhere;word-break:break-word;">${value(row)}</dd>`,
    )
    .join('')}</dl>`;
}

/** Invisible text inbox apps show after the subject; the padding keeps the body out of that preview. */
const PREHEADER_PAD = '&#847;&zwnj;&nbsp;'.repeat(40);

/** One whole email: head, logo, card, footnote and company line. */
function page({ title, preheader, content, footnote }: { title: string; preheader: string; content: string; footnote: string }): string {
  return `<!doctype html>
<html lang="en" dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>td,th,p,a,h1,h2,li{font-family:Arial,sans-serif !important;}</style><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&amp;family=Overpass:wght@800&amp;display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark;supported-color-schemes:dark}
body{margin:0;padding:0;width:100%!important;background:${COLOR.ground};font-family:${SANS};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
a{color:${COLOR.link}}
.text-link:hover{text-decoration-thickness:2px}
.btn-link:hover,.btn-link:focus{background:${COLOR.fillHover}!important;border-color:${COLOR.fillHover}!important}
.btn-link:active{background:${COLOR.fillPressed}!important;border-color:${COLOR.fillPressed}!important}
a:focus-visible{outline:2px solid ${COLOR.fg};outline-offset:3px;border-radius:4px}
.steps li::marker{color:${COLOR.link};font-weight:600}
@media (prefers-reduced-motion:no-preference){.btn-link{transition:background-color .15s ease,border-color .15s ease}}
@media (max-width:620px){
.frame{padding:16px 16px 32px!important}
.card{padding:28px 20px!important}
.h1{font-size:24px!important;line-height:30px!important}
.btn{width:100%!important}
.btn-link{display:block!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${COLOR.ground};font-family:${SANS};">
<div role="article" aria-roledescription="email" aria-label="${escapeHtml(title)}" lang="en" dir="ltr" style="background:${COLOR.ground};">
<div aria-hidden="true" style="display:none;max-height:0;max-width:0;overflow:hidden;mso-hide:all;opacity:0;color:${COLOR.ground};font-size:1px;line-height:1px;">${escapeHtml(preheader)}${PREHEADER_PAD}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.ground}" style="background:${COLOR.ground};">
<tr><td align="center" class="frame" style="padding:32px 16px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;">
<tr><td style="padding:0 4px 18px;"><a href="${SITE}" style="display:inline-block;padding:6px 0;text-decoration:none;"><img src="${LOGO.src}" width="${LOGO.width}" height="${LOGO.height}" alt="MAPL TECH" style="display:block;width:${LOGO.width}px;height:auto;color:${COLOR.fg};font-family:${DISPLAY};font-size:20px;line-height:${LOGO.height}px;font-weight:800;"></a></td></tr>
<tr><td class="card" bgcolor="${COLOR.card}" style="background:${COLOR.card};border:1px solid ${COLOR.line};border-top:3px solid ${COLOR.rule};border-radius:12px;padding:32px;">
${content}
</td></tr>
<tr><td style="padding:24px 4px 0;font-family:${SANS};font-size:14px;line-height:22px;color:${COLOR.muted};">
<p style="margin:0 0 12px;">${footnote}</p>
<p style="margin:0;">© ${new Date().getFullYear()} MAPL TECH <span style="white-space:nowrap;">Canada · Nigeria · Jamaica</span></p>
<p style="margin:0;"><a class="text-link" href="${SITE}" style="display:inline-block;padding:11px 0;margin:-11px 0;color:${COLOR.muted};text-decoration:underline;">mapltech.com</a><span aria-hidden="true"> · </span><a class="text-link" href="${mailto(INBOX)}" style="display:inline-block;padding:11px 0;margin:-11px 0;color:${COLOR.muted};text-decoration:underline;">${INBOX}</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</div>
</body>
</html>`;
}

/** The company line under every plain-text email. */
const textFooter = (footnote: string) =>
  `\n\n--\n${footnote}\n© ${new Date().getFullYear()} MAPL TECH Canada · Nigeria · Jamaica\nmapltech.com · ${INBOX}`;

const textRows = (rows: Row[]) => rows.map(({ label: name, value }) => (value.includes('\n') ? `${name}:\n${value}` : `${name}: ${value}`)).join('\n');

/** Where the entry is in HubSpot, or that it is not there and must be added by hand. */
export function hubspotStatus(form: HubSpotForm, crm: CrmResult): { html: string; text: string } {
  if (crm.ok) {
    const line = `Saved in HubSpot: Marketing › Forms › ${HUBSPOT_FORMS[form].name}.`;
    return { html: paragraph(line, 0, COLOR.muted), text: line };
  }
  const line = `Not saved in HubSpot: ${crm.problem}. Add this entry to HubSpot by hand.`;
  return {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:12px 16px;border-left:4px solid ${COLOR.rule};border-radius:0 8px 8px 0;background:${COLOR.raised};font-family:${SANS};font-size:16px;line-height:24px;font-weight:600;color:${COLOR.fg};">${escapeHtml(line)}</td></tr></table>`,
    text: line,
  };
}

export interface InboxEntry {
  form: HubSpotForm;
  /** The subject the inbox filters on. */
  subject: string;
  /** Who sent it, as the heading names them: the name, or the address when the form asks for none. */
  who: string;
  /** The visitor's address: the email's Reply-To and the reply button's. */
  email: string;
  rows: Row[];
  crm: CrmResult;
  attachments?: EmailAttachment[];
}

/** The entry, for the team: who sent which form, the promise to keep, the answers, and where HubSpot has it. */
export function inboxEmail({ form, subject, who, email, rows, crm, attachments }: InboxEntry): OutgoingEmail {
  const copy = FORM_COPY[form];
  const title = copy.inbox(clip(who, 80));
  const status = hubspotStatus(form, crm);
  const first = firstName(who);
  const reply = form === 'newsletter' ? '' : button(first ? `Reply to ${first}` : 'Reply by email', mailto(email, `Re: ${subject}`));
  const footnote = `Sent by the ${copy.label.toLowerCase()} form on ${copy.where}. Replies to this email go to ${email}.`;
  const content = [
    eyebrow(copy.label),
    heading(title),
    copy.promise ? paragraph(copy.promise, 24) : '',
    reply ? `${reply}<div style="height:32px;line-height:32px;font-size:1px;">&nbsp;</div>` : '',
    answers(rows),
    `<div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>`,
    status.html,
  ].join('');

  return {
    subject,
    html: page({
      title,
      preheader: `${crm.ok ? 'Saved in HubSpot.' : 'Not saved in HubSpot.'}${copy.promise ? ` ${copy.promise}` : ''}`,
      content,
      footnote: escapeHtml(footnote),
    }),
    text: `${title}\n${copy.promise ? `${copy.promise}\n` : ''}\n${textRows(rows)}\n\n${status.text}${textFooter(footnote)}`,
    replyTo: email,
    attachments,
  };
}

export interface VisitorEntry {
  form: HubSpotForm;
  /** The visitor's address. */
  to: string;
  /** The name as typed; only a first name that is plainly one is used. */
  name?: string;
  /** The brief's visitor asked for a call. */
  phone?: boolean;
  /** A resume came with the careers form. */
  resume?: boolean;
}

/** The visitor's confirmation: it arrived, what happens next, and one optional step. */
export function visitorEmail({ form, to, name, phone = false, resume = false }: VisitorEntry): OutgoingEmail {
  const copy = FORM_COPY[form];
  const visitor: Visitor = { first: firstName(name), phone, resume, email: to };
  const title = copy.heading(visitor);
  const lead = copy.lead(visitor);
  const next = copy.steps?.(visitor) ?? [];
  // No eyebrow here: the heading already names the form, so the reading path starts at the h1.
  const content = [
    heading(title),
    paragraphHtml(linkInbox(lead), next.length ? 24 : 16),
    next.length ? steps(next) : '',
    paragraph(copy.more),
    paragraph(SIGN_OFF, 16, COLOR.fg),
    rule,
    // The optional step reads as a postscript: the footnote's quieter colour.
    paragraph(copy.cta.intro, 16, COLOR.muted),
    button(copy.cta.label, copy.cta.href),
  ].join('');

  return {
    to,
    from: VISITOR_FROM,
    replyTo: INBOX,
    subject: copy.subject,
    html: page({ title, preheader: copy.preheader, content, footnote: escapeHtml(copy.reason) }),
    text: `${title}\n\n${lead}${next.length ? `\n\nWhat happens next\n${next.map((step, i) => `${i + 1}. ${step}`).join('\n')}` : ''}\n\n${copy.more}\n\n${SIGN_OFF}\n\n${copy.cta.intro}\n${copy.cta.label}: ${copy.cta.href}${textFooter(copy.reason)}`,
    ...(form === 'newsletter' ? { headers: { 'List-Unsubscribe': `<${mailto(INBOX, 'unsubscribe')}>` } } : {}),
  };
}
