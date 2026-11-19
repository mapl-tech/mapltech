/**
 * The video and the one action label, kept apart from content.ts so the
 * client components (VslPlayer, CallForm) import a few strings, not the case
 * studies and the price list.
 */

export const VSL = {
  /** 28.3 s; the controls count in whole seconds. */
  duration: 28,
  /**
   * The master (public/images/VSL/MAPL-TECH-VSL.mp4) is 4K HEVC 10-bit, which
   * Chrome on many PCs, Firefox and older Android phones cannot play. These are
   * H.264 encodes of it (loudness raised to -16 LUFS, the web norm; it was -24),
   * with the index at the front so playback starts before the file finishes.
   * Change the -v1 in the names when the video changes: they are cached for a year.
   */
  /** Phones (up to 767px wide) get this file; the player picks it (VslPlayer.pickSource). */
  phone: '/images/VSL/mapl-tech-vsl-v1-720.mp4',
  desktop: '/images/VSL/mapl-tech-vsl-v1-1080.mp4',
  poster: '/images/VSL/mapl-tech-vsl-v1-poster.jpg',
  captions: '/images/VSL/mapl-tech-vsl-v1.en.vtt',
  label: 'Video: Leshan Patterson, co-founder of MAPL TECH, in 28 seconds',
  /** Word for word (the captions file holds the same words with their timing). */
  transcript: [
    'Hi, I’m Leshan Patterson, co-founder of MAPL TECH.',
    'We build websites, booking systems, and AI tools for one fixed price and an agreed launch date. Miss the deadline and you don’t pay the final payment.',
    'You need more than a website. You need more customers, more bookings, and more time.',
    'Our Jamaica travel business gets nearly half its customers through AI.',
    'You get weekly progress and you own the code.',
    'Tell me what you’re building and your deadline. Let’s make it happen.',
  ],
} as const;

/** The one action, on every button that opens the call request. */
export const CTA_LABEL = 'Book my call';

/**
 * A scheduling page (Calendly, Cal.com, Zoho Bookings...). When set, the
 * sent screen offers "Pick a time now" beside the 24-hour reply, so "Book my
 * call" can end with a time chosen, as on the funnel this page follows.
 * Empty until MAPL TECH has one: the page then promises the email reply only.
 */
export const BOOKING_URL = '';

/**
 * The captions, word for word with their timing: the player draws them over the
 * picture from this list in every browser (WebKit does not load a hidden
 * track before playback, so the track's own cues cannot drive them there).
 * VSL.captions holds the same cues as WebVTT, for the iPhone's own fullscreen
 * player; vsl.spec.ts fails if the two ever differ.
 */
export const CUES: readonly { start: number; end: number; text: string }[] = [
  { start: 0, end: 3.45, text: "Hi, I’m Leshan Patterson,\nco-founder of MAPL TECH." },
  { start: 3.52, end: 6.84, text: "We build websites, booking systems,\nand AI tools" },
  { start: 6.84, end: 9.7, text: "for one fixed price\nand an agreed launch date." },
  { start: 9.84, end: 12.5, text: "Miss the deadline\nand you don’t pay the final payment." },
  { start: 12.62, end: 14.3, text: "You need more than a website." },
  { start: 14.44, end: 17.6, text: "You need more customers,\nmore bookings, and more time." },
  { start: 17.76, end: 21.5, text: "Our Jamaica travel business gets\nnearly half its customers through AI." },
  { start: 21.7, end: 24.95, text: "You get weekly progress\nand you own the code." },
  { start: 25.04, end: 27.1, text: "Tell me what you’re building\nand your deadline." },
  { start: 27.22, end: 28.4, text: "Let’s make it happen." },
];

/** The caption on screen at `time` seconds, or '' between cues. */
export function cueAt(time: number): string {
  return CUES.find((cue) => time >= cue.start && time < cue.end)?.text ?? '';
}
