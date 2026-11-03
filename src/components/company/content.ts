/**
 * Copy and facts for the company family (/about-us, /team, /careers), Nov 2026
 * simplify pass: plain English, one idea per section. Server-safe: no client
 * imports.
 *
 * Sources, so every sentence can be checked:
 * - The about hero: what the company does, said literally (the homepage hero:
 *   "We build the websites, automation, software and cloud systems that
 *   agencies sell"), then the four service lines and the white-label promise
 *   (the homepage FAQ: "every deliverable carries your brand").
 * - Founders: `executives` in config/team.ts (names, titles, bios, LinkedIn,
 *   photos, the same two the homepage shows).
 * - "Why MAPL TECH exists": the previous about page ("MAPL TECH exists because
 *   agencies shouldn't need to hire a full engineering department...", "We
 *   don't compete with you") and flagship/content.ts WORK_INTRO.
 * - Offices: the published 9 am to 6 pm local office hours (ui/officeTime)
 *   and the published offsets (Lagos 5-6 hours ahead of Toronto; Kingston
 *   keeps no daylight saving time).
 * - Numbers: 200+ projects supported and 25+ years of combined experience as
 *   published on the live homepage (flagship/content.ts PROOF); the lowest
 *   public price is the homepage's LOWEST_PRICE (computed from `pricing`);
 *   role counts from `careers`.
 */
import type { StaticImageData } from 'next/image';
import { LOWEST_PRICE } from '@/components/flagship/content';
import { careers } from '@/config/site';
import { executives, type Executive } from '@/config/team';
import { formatMoney } from '@/lib/estimate';
import { slugify } from '@/lib/schema';
import type { OfficeCity } from './OfficeMap';
// Square, face-centred crops of the founders' own photos, for small avatars.
import leshanAvatar from './leshan-avatar.jpg';
import mercyAvatar from './mercy-avatar.jpg';

/** Headings keep "MAPL TECH" on one line (a no-break space; data and JSON-LD keep the plain space). */
export const keepBrand = (text: string): string => text.replace(/MAPL TECH/g, 'MAPL TECH');

/** A run of display text; accent runs are set in crimson (large type only, 3.66:1). */
export interface TitleRun {
  text: string;
  accent?: boolean;
}

/* ------------------------------------------------------------------ */
/* Founders                                                             */
/* ------------------------------------------------------------------ */

export interface Founder extends Executive {
  slug: string;
  /** The published photo (public path): shown, and used in JSON-LD. */
  image: string;
  /** One line distilled from the team.ts bio, nothing added. */
  focus: string;
  /** Crop for a 4:5 frame cut from a square photo. */
  objectPosition: string;
  /** A square crop of the same photo, centred on the face, for small avatars. */
  avatar: StaticImageData | string;
}

const FOCUS: Record<string, string> = {
  'Leshan Patterson': 'Leads how our systems are designed and built, from automation to speed, and sets the technical direction for the whole company.',
  'Mercy Akuma': 'Leads our growth in new countries, our partnerships and our operations, and keeps work across all three countries on track.',
};

const AVATAR: Record<string, StaticImageData> = {
  'Leshan Patterson': leshanAvatar,
  'Mercy Akuma': mercyAvatar,
};

const CROP: Record<string, string> = {
  'Leshan Patterson': '50% 30%',
  'Mercy Akuma': '40% 20%',
};

export const FOUNDERS: readonly Founder[] = executives.map((exec) => {
  const image = exec.image ?? '';
  return {
    ...exec,
    slug: slugify(exec.name),
    image,
    focus: FOCUS[exec.name] ?? exec.title,
    objectPosition: CROP[exec.name] ?? '50% 30%',
    avatar: AVATAR[exec.name] ?? image,
  };
});

/** "Leshan Patterson and Mercy Akuma" */
export const FOUNDER_NAMES = FOUNDERS.map((f) => f.name).join(' and ');

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function listWords(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}


/** The lowest public price ("$3,500"), the homepage's and the phone bar's figure. */
const LOWEST = formatMoney(LOWEST_PRICE);

/** The public "from" price, the same words on every company page. */
export const PRICE_FACT = { term: 'Public prices from', detail: `${LOWEST} USD` } as const;

/** The same price with the figure set large (FactsBand `figure`), where the band leads with numbers. */
const PRICE_FIGURE = { term: PRICE_FACT.term, figure: LOWEST, detail: 'USD' } as const;

/** Every office's hours (ui/officeTime), in the words /about-us uses. */
const OFFICE_HOURS = 'Every team works 9 am to 6 pm local time, Monday to Friday.';

/* ------------------------------------------------------------------ */
/* /about-us                                                            */
/* ------------------------------------------------------------------ */

export const ABOUT = {
  title: 'About Us',
  description:
    'MAPL TECH builds websites, automation, internal tools and cloud systems for agencies, under the agency’s brand. Two founders, teams in Toronto, Lagos and Kingston, and public prices.',
  hero: {
    label: 'About MAPL TECH',
    // What the company does, said literally (no metaphor), in seven words.
    title: [{ text: 'We build the technology that ' }, { text: 'agencies sell.', accent: true }] as readonly TitleRun[],
    lede: 'That means websites, automation, internal tools and cloud systems for your clients. Your brand goes on the work. Our engineers stay behind it.',
  },
  // The three published figures, set large. Who founded it and where the
  // teams are get their own sections below, so the band does not repeat them.
  facts: [
    { term: 'Projects supported', figure: '200+' },
    { term: 'Experience', figure: '25+', detail: 'years combined' },
    PRICE_FIGURE,
  ],
  story: {
    label: 'Why MAPL TECH exists',
    lead: [
      { text: 'Agencies shouldn’t need to hire a full engineering department to take on a complex project. ' },
      { text: 'That is why MAPL TECH exists.', accent: true },
    ] as readonly TitleRun[],
    paragraphs: [
      `${FOUNDER_NAMES} started MAPL TECH to be the team behind the agency. Our senior engineers build what you sell, under your name. Then we hand it over, ready for your own developers to look after.`,
      'We don’t compete with you, and we never list your client as ours. Most of what we build carries our partners’ names.',
    ],
    workLink: { before: 'The projects that carry ours are on ', label: 'our work page', href: '/our-work', after: '.' },
    signature: 'Co-founders, MAPL TECH',
  },
  offices: {
    label: 'Where we work',
    title: 'Three cities. One team.',
    lede: `Toronto is our headquarters. We also have teams in Lagos, Nigeria and Kingston, Jamaica. ${OFFICE_HOURS}`,
  },
  founders: {
    label: 'Who leads it',
  },
  close: {
    title: 'Say yes to the project you would normally turn down.',
    // The homepage close's line (app/page.tsx): the hero already carries the quote.
    proofLine: 'Clients include LRO Staffing, CHHA-NCR, FOCAS Canada and Crowned Spice.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* /team                                                                */
/* ------------------------------------------------------------------ */

export const TEAM = {
  title: 'Leadership & Global Team',
  description:
    'Meet the people behind MAPL TECH: co-founders Leshan Patterson and Mercy Akuma, and our team in Canada, Nigeria and Jamaica.',
  // No eyebrow: the breadcrumb (About / Team) already names the page.
  hero: {
    title: [{ text: 'The people ' }, { text: 'behind the work.', accent: true }] as readonly TitleRun[],
    lede: `MAPL TECH is led by its co-founders, ${FOUNDER_NAMES}, with a team across Canada, Nigeria and Jamaica.`,
  },
  // What a buyer checks first, the price set large as on /about-us; the open
  // roles are one small line at the foot of the directory.
  facts: [
    { term: 'Co-founders', detail: FOUNDER_NAMES },
    { term: 'Home base', detail: 'Toronto, Canada' },
    { term: 'Offices', detail: 'Toronto · Lagos · Kingston' },
    PRICE_FIGURE,
  ],
  founders: {
    label: 'Leadership',
    title: 'The founders.',
    lede: 'Both are directors of the company. Both are on LinkedIn under their own names, so you can see who you will work with.',
  },
  directory: {
    label: 'The team',
    title: 'Our team, by country.',
    lede: OFFICE_HOURS,
    careers: { before: 'Looking for a job with us? ', label: 'See open roles', href: '/careers' },
  },
  close: {
    title: 'Need a team behind your next client project?',
  },
} as const;

/* ------------------------------------------------------------------ */
/* /careers                                                             */
/* ------------------------------------------------------------------ */

function parts(location: string): string[] {
  return location
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Every number and place below is computed from `careers` in site.ts. */
const roleCountries = Array.from(new Set(careers.map((role) => role.country)));
const roleTypes = Array.from(new Set(careers.map((role) => role.type)));
const onSiteCities = Array.from(new Set(careers.flatMap((role) => parts(role.location).filter((p) => !/remote/i.test(p)))));

/** Roles that can be done remotely, counted from the locations in site.ts. */
const remoteRoles = careers.filter((role) => /remote/i.test(role.location)).length;

/** "Nigeria: 3 roles", "Canada: 2 roles, remote": one office's open roles, for the careers map. */
function officeNote(country: string): string | undefined {
  const roles = careers.filter((role) => role.country === country);
  if (!roles.length) return undefined;
  const allRemote = roles.every((role) => parts(role.location).every((p) => /remote/i.test(p)));
  return `${country}: ${roles.length} ${roles.length === 1 ? 'role' : 'roles'}${allRemote ? ', remote' : ''}`;
}

const ROLE_NOTES: Partial<Record<OfficeCity, string>> = {
  Toronto: officeNote('Canada'),
  Lagos: officeNote('Nigeria'),
  Kingston: officeNote('Jamaica'),
};

const typeWord = roleTypes.length === 1 ? `${roleTypes[0].toLowerCase()} ` : '';

export const CAREERS = {
  title: 'Careers',
  description: `MAPL TECH is hiring: ${countWord(careers.length).toLowerCase()} ${typeWord}roles in ${listWords(roleCountries)}, remote or on-site in ${listWords(onSiteCities)}. One short form to apply.`,
  hero: {
    label: 'Careers',
    title: [{ text: 'Build the systems ' }, { text: 'agencies sell.', accent: true }] as readonly TitleRun[],
    lede: `${careers.length} ${typeWord}roles in ${listWords(roleCountries)}. ${remoteRoles} of them can be done remotely. To apply, fill in one short form.`,
  },
  facts: [
    { term: 'Open roles', detail: `${careers.length}${roleTypes.length === 1 ? `, all ${roleTypes[0].toLowerCase()}` : ''}` },
    { term: 'On site', detail: listWords(onSiteCities) },
    { term: 'Remote', detail: `${remoteRoles} of ${careers.length} roles` },
    { term: 'To apply', detail: 'One short form, no upload' },
  ],
  map: {
    notes: ROLE_NOTES,
    caption: 'Open roles by country, at our three offices, drawn to scale.',
  },
  roles: {
    label: 'Now hiring',
    title: 'Open roles.',
    lede: 'Filter by country or by remote work. Each Apply button opens the form with that role already chosen.',
  },
  apply: {
    label: 'How hiring works',
    title: 'How to apply.',
    lede: 'No cover letter and no file upload. A short note is enough, and a link to your work helps.',
    steps: [
      { name: 'Pick a role', text: 'Or choose a general application if none fits yet.' },
      { name: 'Tell us about you', text: 'Your name, your email and a few lines on why the role fits you.' },
      { name: 'Hear back by email', text: 'We read every application and reply by email.' },
    ],
    // Beside the form: who a candidate would work with, and what we make.
    evidence: {
      before: 'Before you apply, ',
      team: { label: 'meet the team', href: '/team' },
      between: ' and ',
      work: { label: 'see our work', href: '/our-work' },
      after: '.',
    },
  },
  talent: {
    summary: 'Don’t see your fit? Join the talent list.',
    lede: 'Tell us what you do best, and we’ll write when a matching role opens.',
  },
  close: {
    // The page's candidate asks come first; the close speaks to the agency
    // owner who came to see who would be doing the work.
    title: 'Here to hire us instead?',
  },
  countries: roleCountries,
  types: roleTypes,
} as const;
