import { mockHouses } from '../data/mockHouses';
import type { DealType, Listing, ListingFilters, PriceRangeId, RoomsFilter } from '../types/listing';
import { shuffle } from '../utils/shuffle';
import { isLive, isNew } from '../utils/time';

// Phase 2: replace the body of these functions with Supabase queries.
// Screens only talk to this module, so nothing else needs to change.

export interface PriceRange {
  id: PriceRangeId;
  label: string;
  min: number;
  max: number;
}

// Sale prices are totals, rents are per month, so each deal type has its own steps.
// The 'all' label comes from i18n ('filter.allPrices').
export const PRICE_RANGES: Record<DealType, PriceRange[]> = {
  sale: [
    { id: 'all', label: '', min: 0, max: Infinity },
    { id: 'low', label: '< 50K $', min: 0, max: 50000 },
    { id: 'mid', label: '50K – 100K $', min: 50000, max: 100000 },
    { id: 'high', label: '100K $ +', min: 100000, max: Infinity },
  ],
  rent: [
    { id: 'all', label: '', min: 0, max: Infinity },
    { id: 'low', label: '< 400 $', min: 0, max: 400 },
    { id: 'mid', label: '400 – 800 $', min: 400, max: 800 },
    { id: 'high', label: '800 $ +', min: 800, max: Infinity },
  ],
};

export const ROOMS_FILTERS: RoomsFilter[] = ['all', '1', '2', '3', '4+'];

export async function fetchListings(): Promise<Listing[]> {
  await new Promise((r) => setTimeout(r, 350));
  // Expired listings (older than LISTING_LIFETIME_DAYS) never reach the feed.
  return mockHouses.filter((l) => isLive(l.createdAt));
}

export const isPriceDrop = (l: Listing) => l.oldPriceUsd !== undefined && l.oldPriceUsd > l.priceUsd;
export const isFresh = (l: Listing) => isNew(l.createdAt) || isPriceDrop(l);

export interface FeedArrangement {
  listings: Listing[];
  // Ids that were already seen when this order was built. The first card in the
  // feed with one of these ids gets the "you've seen everything below" divider.
  seenAtLoad: Set<string>;
}

// Feed order, Instagram style: listings this device hasn't seen yet come first,
// freshly shuffled on every load; the ones it has seen follow in a stable order
// (oldest view first). Once everything has been seen, the whole feed is shuffled.
// `pinnedId` (from a shared link) always goes first.
export function arrangeFeed(listings: Listing[], seen: Map<string, number>, pinnedId?: string | null): FeedArrangement {
  const pinned = pinnedId ? listings.filter((l) => l.id === pinnedId) : [];
  const rest = pinned.length ? listings.filter((l) => l.id !== pinnedId) : listings;
  const unseen = rest.filter((l) => !seen.has(l.id));
  if (unseen.length === 0 || unseen.length === rest.length) {
    return { listings: [...pinned, ...shuffle(rest)], seenAtLoad: new Set() };
  }
  const seenListings = rest
    .filter((l) => seen.has(l.id))
    .sort((a, b) => (seen.get(a.id) ?? 0) - (seen.get(b.id) ?? 0));
  return {
    listings: [...pinned, ...shuffle(unseen), ...seenListings],
    seenAtLoad: new Set(seenListings.map((l) => l.id)),
  };
}

export const DEFAULT_FILTERS: ListingFilters = {
  dealType: 'sale',
  type: null,
  city: null,
  rooms: 'all',
  priceRange: 'all',
  onlyNew: false,
};

// A shared listing may be a rental while the default filter is "sale"; the feed
// switches to the deal type of the pinned listing so the link always shows it.
export function filtersFor(pinned: Listing | undefined): ListingFilters {
  return pinned ? { ...DEFAULT_FILTERS, dealType: pinned.dealType } : DEFAULT_FILTERS;
}

const roomsMatch = (rooms: number, f: RoomsFilter) =>
  f === 'all' || (f === '4+' ? rooms >= 4 : rooms === Number(f));

export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  const ranges = PRICE_RANGES[filters.dealType];
  const range = ranges.find((r) => r.id === filters.priceRange) ?? ranges[0];
  return listings.filter(
    (l) =>
      l.dealType === filters.dealType &&
      (!filters.type || l.type === filters.type) &&
      (!filters.city || l.city === filters.city) &&
      roomsMatch(l.rooms, filters.rooms) &&
      l.priceUsd >= range.min &&
      l.priceUsd < range.max &&
      (!filters.onlyNew || isFresh(l)),
  );
}

export function countFresh(listings: Listing[]) {
  return {
    newToday: listings.filter((l) => isNew(l.createdAt)).length,
    priceDrops: listings.filter(isPriceDrop).length,
  };
}
