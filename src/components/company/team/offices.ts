import type { Country } from '@/config/team';

/**
 * The three offices in site order, each with its IANA zone, as the rest of the
 * company family names them (OfficeList, the regional pages). Toronto is
 * headquarters. Every office keeps the published working day (ui/officeTime:
 * 9 am to 6 pm local, Monday to Friday). Client-safe.
 */
export interface Office {
  city: 'Toronto' | 'Lagos' | 'Kingston';
  country: Country;
  timeZone: string;
  hq?: boolean;
}

export const OFFICES: readonly Office[] = [
  { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', hq: true },
  { city: 'Lagos', country: 'Nigeria', timeZone: 'Africa/Lagos' },
  { city: 'Kingston', country: 'Jamaica', timeZone: 'America/Jamaica' },
];

export const officeOf = (country: string): Office | undefined => OFFICES.find((office) => office.country === country);
