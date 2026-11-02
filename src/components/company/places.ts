/**
 * "Lagos / Remote" reads as "Lagos or remote" on screen. The data in site.ts
 * keeps its slashes (it feeds the JobPosting JSON-LD unchanged). Client-safe.
 */
export function placeWords(location: string): string {
  const words = location
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/^remote$/i.test(part) ? 'remote' : part))
    .join(' or ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
