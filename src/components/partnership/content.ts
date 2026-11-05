/**
 * /white-label: how working with MAPL TECH runs, for agency founders (Nov 5,
 * 2026, from the competitor analysis: GetDevDone, Seahawk and Codeable each
 * spell out their white-label mechanics; we had the promises, not the page).
 *
 * Every line is a fact the site already publishes, in the voice guide's peer
 * register (memory: redesign-artifacts/VOICE-GUIDE.md):
 * - NDA first, never approach your clients, your brand on everything, you own
 *   the code: the home track record and the white-label FAQ (home/data.ts).
 * - "Your client talks to your team, not to us, and we never list your client
 *   as ours": the white-label FAQ.
 * - "We join your Slack and your team check-ins": the timezone FAQ; the weekly
 *   check-in: the home process.
 * - Clear notes at handover: the code-ownership FAQ. Support for 30 to 90
 *   days, then a monthly plan: the after-launch FAQ.
 * - "We respond within 24 hours": /contact-us on the live site.
 * The fit guide gives advice, not claims about anyone else: no numbers, no
 * names, nothing a reader could check against a competitor.
 */
import { CLOSE_BAND, LOWEST_PRICE } from '@/components/flagship/content';

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

export const WHITE_LABEL_PATH = '/white-label';

export const WHITE_LABEL = {
  title: 'White-Label Development Partner for Agencies',
  description:
    'How white-label work with MAPL TECH runs: an NDA first, we join your Slack and check-ins, your client only hears from you, and you own the code.',
  hero: {
    label: 'How we work',
    lede: 'We work with your team on client projects. We build the websites, automation, software and cloud systems your clients buy from you, and hand over the code with clear notes.',
  },
  facts: [
    // "Within", as /contact-us publishes it (and the office pages' "Within 24 hours").
    { term: 'We reply within', figure: '24 hours', detail: 'of your brief' },
    { term: 'Support after launch', figure: '30–90', detail: 'days, in every package' },
    // Worded as /about-us sets the same figure (company/content.ts PRICE_FIGURE).
    { term: 'Public prices from', figure: money(LOWEST_PRICE), detail: 'USD' },
  ],
  process: {
    label: 'From brief to launch',
    title: 'How a project runs.',
    lede: 'The same four steps on every project, so your team always knows what happens next.',
  },
  roles: {
    label: 'Who does what',
    title: 'You keep the client. We do the engineering.',
    lede: 'The split is the same on every project. Your client deals with your agency, and we work with your team.',
    yours: {
      heading: 'Your agency keeps',
      items: [
        { lead: 'The client relationship.', text: 'Your client talks to your team, not to us.' },
        { lead: 'Your brand.', text: 'Everything we make carries it.' },
        { lead: 'The code.', text: 'You and your client own it when the project ends.' },
        { lead: 'Your client’s name.', text: 'We never list your client as ours.' },
      ],
    },
    ours: {
      heading: 'MAPL TECH handles',
      items: [
        { lead: 'The build.', text: 'Websites, automation and AI, internal tools and cloud.' },
        { lead: 'Working with your team.', text: 'We join your Slack and your weekly check-ins.' },
        { lead: 'The handover.', text: 'Clear notes, so your team can carry on where we left off.' },
        { lead: 'Support after launch.', text: '30 to 90 days, then a monthly plan if you want one.' },
      ],
    },
  },
  fit: {
    label: 'Choosing a partner',
    title: 'When to bring us in.',
    lede: 'Sometimes the right answer is not us. Here is how we would decide.',
    options: [
      {
        heading: 'Hire in-house',
        text: 'When there is steady engineering work every week, and you want that skill inside your agency for the long term.',
      },
      {
        heading: 'Use a freelancer',
        text: 'When the task is small and clear, and someone on your team has time to manage it.',
      },
      {
        heading: 'Bring in MAPL TECH',
        text: 'When a client project needs more people or skills than your team has. We work with your team, on one fixed quote and under your brand.',
        ours: true,
      },
    ],
  },
  voice: {
    // One client's quote on this page (the homepage's "In their words" sets two voices).
    label: 'In a client’s words',
  },
  // The site's close line (voice guide), with its no-break space in "20 minutes": the page is
  // "part of your team", so the ask says "together", not "a project that needs a team".
  close: CLOSE_BAND,
} as const;
