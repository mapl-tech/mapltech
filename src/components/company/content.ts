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
 * - The about story ("Our story"): the previous about page ("MAPL TECH exists
 *   because agencies shouldn't need to hire a full engineering department...",
 *   "We don't compete with you") and flagship/content.ts WORK_INTRO ("Most of
 *   what we build carries our partners' brands"), which leads to the work.
 *   How we work with the agency's team (Nov 5, 2026, "make it collaboration
 *   focused"): the home process ("We join your Slack and your weekly
 *   check-ins. Your client only hears from your team.") and /white-label
 *   ("hand them back with clear notes"); nothing else is added.
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
import { displayName, executives, type Executive } from '@/config/team';
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
  /** The name as shown, with its title ("Dr. Mercy Akuma"); `name` stays the key. */
  displayName: string;
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
  'Leshan Patterson': 'Leads how our systems are designed and built, and sets the technical direction for the whole company.',
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
    displayName: displayName(exec),
    image,
    focus: FOCUS[exec.name] ?? exec.title,
    objectPosition: CROP[exec.name] ?? '50% 30%',
    avatar: AVATAR[exec.name] ?? image,
  };
});

/** "Leshan Patterson and Dr. Mercy Akuma" */
export const FOUNDER_NAMES = FOUNDERS.map((f) => f.displayName).join(' and ');

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

/**
 * The office hours as a fact (the regional pages' band): the same published
 * working day as OFFICE_HOURS below and ui/officeTime (WORK_START/WORK_END),
 * written out because this file stays free of client modules.
 */
export const OFFICE_HOURS_FACT = { term: 'Office hours', detail: '9 am to 6 pm, Monday to Friday' } as const;

/** The published combined experience, figure first. */
const EXPERIENCE_FIGURE = { term: 'Experience', figure: '25+', detail: 'years combined' } as const;

/** Every office's hours (ui/officeTime), in the words /about-us uses. */
const OFFICE_HOURS = 'Each office is open 9 am to 6 pm local time, Monday to Friday.';

/* ------------------------------------------------------------------ */
/* /about-us                                                            */
/* ------------------------------------------------------------------ */

export const ABOUT = {
  title: 'About Us',
  description:
    'MAPL TECH works with agency teams on websites, automation, internal tools and cloud, under the agency’s brand. We have offices in Toronto, Lagos and Kingston.',
  hero: {
    label: 'About MAPL TECH',
    // What the company does, said literally (no metaphor), in seven words.
    title: [{ text: 'We build the technology that ' }, { text: 'agencies sell.', accent: true }] as readonly TitleRun[],
    lede: 'We work with your team on the websites, automation, internal tools and cloud systems your clients need. Your brand goes on the work, and your client only hears from you.',
  },
  // The three published figures, set large. Who founded it and where the
  // teams are get their own sections below, so the band does not repeat them.
  facts: [{ term: 'Projects supported', figure: '200+' }, EXPERIENCE_FIGURE, PRICE_FIGURE],
  story: {
    // A plain kicker: the heading itself says why MAPL TECH exists.
    label: 'Our story',
    lead: [
      { text: 'Agencies shouldn’t need to hire a full engineering department to take on a complex project. ' },
      { text: 'That is why MAPL TECH exists.', accent: true },
    ] as readonly TitleRun[],
    paragraphs: [
      `${FOUNDER_NAMES} started MAPL TECH to work alongside agency teams. We build what you sell, under your brand, in your Slack and your weekly check-ins. Then we hand over the work with clear notes, so your own developers can carry on.`,
      'We don’t compete with you, and we never list your client as ours. Most of what we build carries our partners’ names.',
    ],
    // The page body's route to the work, after the line about whose names the work carries.
    work: { label: 'See the work', href: '/our-work' },
    signature: 'Co-founders, MAPL TECH',
  },
  offices: {
    label: 'Where we work',
    title: 'Three cities. One team.',
    // Each team with its country in its own clause, so the two city-country pairs never run together.
    lede: `Toronto is our headquarters, with offices in Lagos and Kingston. ${OFFICE_HOURS}`,
  },
  founders: {
    label: 'Who leads it',
    title: 'The founders.',
    lede: 'Both are directors of the company. Each is on LinkedIn under their own name, so you can see who leads the company.',
  },
  close: {
    // The story's point (a complex project without hiring an engineering department), as the next step.
    title: 'Say yes to the project you would normally turn down.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* /team                                                                */
/* ------------------------------------------------------------------ */

export const TEAM = {
  title: 'Leadership & Global Team',
  description:
    `Meet the MAPL TECH team that works alongside yours: co-founders ${FOUNDER_NAMES}, and our team in Canada, Nigeria and Jamaica.`,
  // No eyebrow: the breadcrumb (About / Team) already names the page.
  hero: {
    title: [{ text: 'The people ' }, { text: 'behind the work.', accent: true }] as readonly TitleRun[],
    lede: `MAPL TECH is led by its co-founders, ${FOUNDER_NAMES}. Our team in Canada, Nigeria and Jamaica works alongside yours, under your brand.`,
  },
  // What a buyer checks first, each said once on the page, set in the hero's
  // aside as /about-us sets its figures: the lede names the founders and the
  // three countries and the directory gives each office's city, so the aside
  // says which one is headquarters, the published experience and the public
  // price. The open roles are one small line at the foot of the directory.
  facts: [{ term: 'Headquarters', figure: 'Toronto', detail: 'Canada' }, EXPERIENCE_FIGURE, PRICE_FIGURE],
  founders: {
    label: 'Leadership',
    // No lede: the two bios right under the title say who leads what.
    title: 'The founders.',
    // The page body's route to the work, after the two people: the people, then what they have built.
    work: { label: 'See the work', href: '/our-work' },
  },
  directory: {
    label: 'The team',
    title: 'Our team, by country.',
    lede: OFFICE_HOURS,
    careers: { before: 'Looking for a job with us? ', label: 'See open roles', href: '/careers' },
  },
  close: {
    title: 'Need an engineering team to work with yours on the next client project?',
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
    // What is open, counted in words as prose counts (the meta description says "seven" too). Where
    // the work happens is the facts band's (the remote count in numerals, the on-site cities), so
    // each count is said once. How to apply (one short form, no upload) is said once, in the apply
    // section's lede over the form.
    lede: `${countWord(careers.length)} ${typeWord}roles in ${listWords(roleCountries)}. You work with our team and alongside the teams at our partner agencies.`,
  },
  // Where the roles are done; the lede has already said how many there are and that they are contracts.
  facts: [
    { term: 'Remote', detail: `${remoteRoles} ${remoteRoles === 1 ? 'role' : 'roles'}` },
    { term: 'On site', detail: listWords(onSiteCities) },
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
      team: { label: 'meet the team you would join', href: '/team' },
      between: ' and ',
      work: { label: 'see our work', href: '/our-work' },
      after: '.',
    },
  },
  talent: {
    summary: 'Don’t see a role that fits? Join the talent list.',
    lede: 'Tell us what you do best, and we’ll write when a matching role opens.',
  },
  close: {
    // The page's candidate asks come first; the close speaks to the agency
    // owner who came to see who would be doing the work.
    title: 'Here for a client project instead?',
  },
  countries: roleCountries,
  types: roleTypes,
} as const;
