import { SOM_PER_USD } from '../constants/config';
import type { Lang } from '../constants/i18n';
import type { Listing } from '../types/listing';

export type Currency = 'usd' | 'som';

const group = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const PER_MONTH: Record<Lang, string> = { ru: '/мес', ky: '/ай', tr: '/ay' };
const MILLION: Record<Lang, string> = { ru: 'млн', ky: 'млн', tr: 'milyon' };

// Som figures are rounded so a converted price reads like a listing, not a calculator.
export function displayedAmount(usd: number, currency: Currency): number {
  if (currency === 'usd') return usd;
  const raw = usd * SOM_PER_USD;
  if (raw >= 1_000_000) return Math.round(raw / 1000) * 1000;
  if (raw >= 10_000) return Math.round(raw / 100) * 100;
  return Math.round(raw / 10) * 10;
}

function unit(currency: Currency): string {
  return currency === 'usd' ? '$' : 'сом';
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${group(amount)} ${unit(currency)}`;
}

// Rentals are priced per month: "450 $/мес" or "39 400 сом/ай".
export function priceLabel(l: Pick<Listing, 'dealType'>, usd: number, lang: Lang, currency: Currency): string {
  const base = formatMoney(displayedAmount(usd, currency), currency);
  return l.dealType === 'rent' ? `${base}${PER_MONTH[lang]}` : base;
}

// Difference between the two figures the card actually shows, so the badge matches them.
export function priceDropLabel(
  l: Pick<Listing, 'dealType' | 'priceUsd' | 'oldPriceUsd'>,
  lang: Lang,
  currency: Currency,
): string {
  const drop = displayedAmount(l.oldPriceUsd ?? l.priceUsd, currency) - displayedAmount(l.priceUsd, currency);
  const base = formatMoney(drop, currency);
  return l.dealType === 'rent' ? `${base}${PER_MONTH[lang]}` : base;
}

// Short bounds for the filter chips: "50K $" or "4,4 млн сом".
export function formatFilterBound(usd: number, currency: Currency, lang: Lang): string {
  if (currency === 'usd') {
    if (usd >= 10_000 && usd % 1000 === 0) return `${usd / 1000}K $`;
    return `${group(usd)} $`;
  }
  const som = usd * SOM_PER_USD;
  if (som >= 1_000_000) {
    const text = (Math.round((som / 1_000_000) * 10) / 10).toFixed(1).replace(/\.0$/, '').replace('.', ',');
    return `${text} ${MILLION[lang]} сом`;
  }
  return `${group(Math.round(som / 1000) * 1000)} сом`;
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
