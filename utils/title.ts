import { translate, type Lang } from '../constants/i18n';
import type { Listing } from '../types/listing';
import { formatArea, formatSotka } from './format';

// "2-комн. квартира, 58 м²" / "Дом, 180 м², 6 сот." / "Участок, 8 сот."
export function listingTitle(l: Listing, lang: Lang): string {
  switch (l.type) {
    case 'apartment':
      return `${l.rooms === 0 ? translate(lang, 'title.studio') : translate(lang, 'title.apartment', { n: l.rooms })}, ${formatArea(l.areaM2)}`;
    case 'house':
      return `${translate(lang, 'title.house')}, ${formatArea(l.areaM2)}${l.landSotka ? `, ${formatSotka(l.landSotka, lang)}` : ''}`;
    case 'dacha':
      return `${translate(lang, 'title.dacha')}, ${formatArea(l.areaM2)}${l.landSotka ? `, ${formatSotka(l.landSotka, lang)}` : ''}`;
    case 'land':
      return `${translate(lang, 'title.land')}, ${formatSotka(l.landSotka ?? Math.round(l.areaM2 / 100), lang)}`;
    case 'commercial':
      return `${translate(lang, 'title.commercial')}, ${formatArea(l.areaM2)}`;
  }
}
