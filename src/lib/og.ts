/**
 * The site's share image (1200x630), for link previews in search, social
 * and AI answers. Pages that set their own `openGraph` replace the root
 * layout's whole object, so each one passes this in again (Nov 5, 2026: ten
 * pages had shipped without an image).
 */
export const OG_IMAGE = {
  url: '/images/og-flagship.jpg',
  width: 1200,
  height: 630,
  alt: 'MAPL TECH: The engineering backbone behind your agency. A spine of crimson, graphite and chrome rods beside the headline.',
} as const;
