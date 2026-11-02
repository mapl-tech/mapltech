/**
 * Copy and facts for the company family (/about-us, /team, /careers), flagship
 * redesign, Nov 2026. Server-safe: no client imports.
 *
 * Sources, so every sentence can be checked:
 * - Founders: `executives` in config/team.ts (names, titles, bios, LinkedIn,
 *   photos; Mercy Akuma's is the one the homepage shows).
 * - "Why we exist": the previous about page ("MAPL TECH exists because
 *   agencies shouldn't need to hire a full engineering department...", "We
 *   don't compete with you") and flagship/content.ts WORK_INTRO.
 * - How we work: the homepage white-label promises and process steps
 *   (home/data.ts TRUST, PLUG_IN, FAQ_ITEMS): mutual NDA and non-solicit,
 *   20-minute scoping call, weekly demos, 30-90 days of post-launch support.
 * - Proof: the one approved client quote (site.ts `testimonials`).
 * - Numbers: 200+ projects supported and 25+ years of combined experience as
 *   published on the live homepage (flagship/content.ts PROOF); the lowest
 *   public price is computed from `pricing`.
 */
import type { StaticImageData } from 'next/image';
import { careers, testimonials } from '@/config/site';
import { executives, type Executive } from '@/config/team';
import { slugify } from '@/lib/schema';
import { ESTIMATE_HREF } from '@/components/layout/chrome';
import type { OfficeCity } from './OfficeMap';
import { SERVICE_NAMES, lowestStartingPrice } from './regions';
// A 4:5 crop of Leshan's own photo (public/images/team/leshan-patterson.jpg),
// cut above the event's sponsor banner. Same pixels, no retouching.
import leshanPortrait from './leshan-portrait.jpg';
// Square, face-centred crops of the same two photos for small avatars.
import leshanAvatar from './leshan-avatar.jpg';
import mercyAvatar from './mercy-avatar.jpg';

/** The one primary action and the one secondary, labelled as everywhere else on the site. */
export const PRICE_CTA = { label: 'Price your project', href: ESTIMATE_HREF } as const;
export const CALL_CTA = { label: 'Book a call', href: '/contact-us' } as const;
export const TRUST_LINE = 'You see a published price before we ask for anything.';

/** Headings keep "MAPL TECH" on one line (a no-break space; data and JSON-LD keep the plain space). */
export const keepBrand = (text: string): string => text.replace(/MAPL TECH/g, 'MAPL\u00a0TECH');

/* ------------------------------------------------------------------ */
/* Founders                                                             */
/* ------------------------------------------------------------------ */

export interface Founder extends Executive {
  slug: string;
  /** The published photo (public path): used in JSON-LD. */
  image: string;
  /** What the page shows: the same photo, cropped to 4:5 where it needed it. */
  portrait: StaticImageData | string;
  /** One line distilled from the team.ts bio, nothing added. */
  focus: string;
  /** Crop for a 4:5 frame cut from a square photo. */
  objectPosition: string;
  /** A square crop of the same photo, centred on the face, for small avatars. */
  avatar: StaticImageData | string;
}

const PORTRAIT: Record<string, StaticImageData> = {
  'Leshan Patterson': leshanPortrait,
};

const FOCUS: Record<string, string> = {
  'Leshan Patterson': 'Leads architecture, automation systems and performance engineering, and sets technical strategy across every division.',
  'Mercy Akuma': 'Oversees international growth, strategic partnerships and operational expansion, and keeps cross-border delivery aligned.',
};

const AVATAR: Record<string, StaticImageData> = {
  'Leshan Patterson': leshanAvatar,
  'Mercy Akuma': mercyAvatar,
};

const CROP: Record<string, string> = {
  'Mercy Akuma': '40% 20%',
};

export const FOUNDERS: readonly Founder[] = executives.map((exec) => {
  const image = exec.image ?? '';
  return {
    ...exec,
    slug: slugify(exec.name),
    image,
    portrait: PORTRAIT[exec.name] ?? image,
    focus: FOCUS[exec.name] ?? exec.title,
    objectPosition: CROP[exec.name] ?? '50% 30%',
    avatar: AVATAR[exec.name] ?? image,
  };
});

/** "Leshan Patterson and Mercy Akuma" */
export const FOUNDER_NAMES = FOUNDERS.map((f) => f.name).join(' and ');

/* ------------------------------------------------------------------ */
/* /about-us                                                            */
/* ------------------------------------------------------------------ */

export const ABOUT = {
  title: 'About Us',
  description:
    'MAPL TECH is the engineering team behind agencies: two founders, senior engineers in Toronto, Lagos and Kingston, white-label delivery and public prices.',
  hero: {
    eyebrow: 'About MAPL TECH',
    titleLines: ['The engineers', "behind your agency's name."] as const,
    lede: `${SERVICE_NAMES} for digital agencies, shipped under your brand by senior engineers in Toronto, Lagos and Kingston.`,
  },
  facts: [
    { term: 'Founded by', detail: FOUNDER_NAMES },
    { term: 'Home base', detail: 'Toronto, Canada' },
    { term: 'Teams in', detail: 'Lagos, Nigeria · Kingston, Jamaica' },
    { term: 'Experience', detail: '25+ years combined' },
    { term: 'Projects supported', detail: '200+' },
    { term: 'Prices from', detail: `${lowestStartingPrice()} (USD), public` },
  ],
  story: {
    title: 'Why MAPL TECH exists.',
    lead: "Agencies shouldn't need to hire a full engineering department to take on a complex project. That is why MAPL TECH exists.",
    paragraphs: [
      `${FOUNDER_NAMES} built it to be the team behind the agency: senior engineers who build what you sell, under your name, and hand it back in a state your own developers can maintain.`,
      "We don't compete with you, and we never list your client as ours. Most of what we build ships under our partners' names.",
    ],
    workLink: { before: 'The projects that carry ours are on ', label: 'our work page', href: '/our-work', after: '.' },
    signature: 'Co-founders, MAPL TECH',
  },
  howWeWork: {
    title: 'How we work behind your brand.',
    lede: 'White-label from the first email to the last commit: your brand on every deliverable, your PM in front of your client, and code your developers can keep.',
    stages: [
      {
        id: 'how-nda',
        name: 'Before you send anything',
        text: 'We sign a mutual NDA and non-solicit. We never contact your client, and we never list your client as ours.',
      },
      {
        id: 'how-scope',
        name: 'Scope',
        text: 'A 20-minute call about your agency, your client and the build. You leave with a fixed range from our public price list.',
      },
      {
        id: 'how-build',
        name: 'Build',
        text: 'Your PM, our engineers. We join your Slack and your standups and ship with weekly demos. Every deliverable carries your brand.',
      },
      {
        id: 'how-handoff',
        name: 'Hand-off',
        text: 'Documented code, training and 30 to 90 days of post-launch support, depending on tier. Your developers can read it, extend it and maintain it.',
      },
    ],
    after: 'After launch, retainer and partnership models keep your systems maintained and evolving.',
  },
  work: {
    title: 'Work that carries our name.',
    lede: 'Live products our team built and shipped, each with the case study behind it.',
  },
  offices: {
    title: 'Three offices. Your working day.',
    lede: 'MAPL TECH is based in Toronto, with teams in Lagos, Nigeria and Kingston, Jamaica. Each office keeps 09:00 to 18:00 local hours, Monday to Friday. Here is how that lands in your day.',
    footnote:
      'Lagos is 5 hours ahead of Toronto in summer and 6 in winter. Kingston does not observe daylight saving time, so it matches Toronto in winter and sits one hour behind in summer.',
  },
  close: {
    title: "Say yes to the build you'd normally turn down.",
    lede: 'Pick what it is. The estimator opens with it selected, and the price is on screen before we ask for anything.',
  },
} as const;

/** The one approved client quote: Alita Fabiano, LRO Staffing. */
export const PROOF_QUOTE = testimonials.find((t) => t.company === 'LRO Staffing') ?? null;

/* ------------------------------------------------------------------ */
/* /team                                                                */
/* ------------------------------------------------------------------ */

export const TEAM = {
  title: 'Leadership & Global Team',
  description:
    'Meet the people behind MAPL TECH: co-founders Leshan Patterson and Mercy Akuma, and our team in Canada, Nigeria and Jamaica, building under agency brands.',
  hero: {
    eyebrow: 'Leadership and team',
    titleLines: ['The people', 'behind the work.'] as const,
    lede: `MAPL TECH is led by its co-founders, ${FOUNDER_NAMES}, with a team across Canada, Nigeria and Jamaica.`,
  },
  facts: [
    { term: 'Co-founders', detail: FOUNDER_NAMES },
    { term: 'Home base', detail: 'Toronto, Canada' },
    { term: 'Offices', detail: 'Toronto · Lagos · Kingston' },
    { term: 'Open roles', detail: `${careers.length}, across ${listWords(Array.from(new Set(careers.map((r) => r.country))))}` },
  ],
  founders: {
    title: 'The founders.',
    lede: 'Both are directors of the company, and both are on LinkedIn under their own names, so you can check who you would be working with.',
  },
  work: {
    title: 'What the team ships.',
    lede: 'Live products built by MAPL TECH, each with the case study behind it.',
  },
  directory: {
    title: 'The team, by country.',
  },
  close: {
    title: 'Put us behind your next client build.',
    lede: 'Pick what it is. The estimator opens with it selected, and the price is on screen before we ask for anything.',
  },
} as const;

/* ------------------------------------------------------------------ */
/* /careers                                                             */
/* ------------------------------------------------------------------ */

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function listWords(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

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
    eyebrow: 'Careers',
    titleLines: ['Build the systems', 'agencies sell.'] as const,
    lede: `${careers.length} ${typeWord}roles in ${listWords(roleCountries)}, ${remoteRoles} of them open to remote work. Applying takes one short form.`,
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
    title: 'Open roles.',
    lede: 'Filter by country or by remote work. Every Apply link opens the same short form with that role already chosen.',
  },
  apply: {
    title: 'Apply.',
    lede: 'No cover letter and no upload. A short note is enough to start the conversation, and a link to your work helps.',
    steps: [
      { name: 'Pick a role', text: 'Or choose a general application if none fits yet.' },
      { name: 'Tell us who you are', text: 'Your name and email, a few lines on why the role fits, and a link to your work if you have one.' },
      { name: 'Hear back by email', text: 'We read every application and reply by email.' },
    ],
  },
  work: {
    title: "The work you'd ship.",
    lede: 'Live products our teams built and shipped, for agency clients and for ourselves, each with the case study behind it.',
  },
  talent: {
    title: "Don't see your fit?",
    lede: "We're always open to exceptional people. Tell us what you do best, and we'll write when a matching role opens.",
  },
  countries: roleCountries,
  types: roleTypes,
} as const;
