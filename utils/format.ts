import type { Lang } from '../constants/i18n';
import type { Listing } from '../types/listing';

const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// "65 000 $" — thin grouping with plain spaces so it renders the same everywhere.
export function formatPrice(usd: number): string {
  return `${group(usd)} $`;
}

const PER_MONTH: Record<Lang, string> = { ru: '/мес', ky: '/ай', tr: '/ay' };

// Rentals are priced per month: "450 $/мес".
export function priceLabel(l: Pick<Listing, 'dealType'>, usd: number, lang: Lang): string {
  return l.dealType === 'rent' ? `${formatPrice(usd)}${PER_MONTH[lang]}` : formatPrice(usd);
}

export function formatArea(m2: number): string {
  return `${group(m2)} м²`;
}

const SOTKA: Record<Lang, (n: number) => string> = {
  ru: (n) => `${n} сот.`,
  ky: (n) => `${n} сотых`,
  tr: (n) => `${n} sotka`,
};
export const formatSotka = (n: number, lang: Lang) => SOTKA[lang](n);
