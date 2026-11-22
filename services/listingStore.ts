import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockHouses } from '../data/mockHouses';
import { LISTINGS_KEY } from '../constants/storage';
import type { Listing } from '../types/listing';

// The local catalogue. It is seeded once from the demo data and then owned by the
// admin panel. Phase 2 replaces this module with Supabase queries; the screens
// only talk to ListingsContext, so nothing else has to change.
//
// Demo rows get explicit admin metadata so the panel has something to show:
// active, paid, with a readable demo payment code.

export function withAdminDefaults(listing: Listing): Listing {
  return {
    status: 'active',
    paid: true,
    paymentCode: `DEMO-${listing.id.toUpperCase()}`,
    paidAt: listing.createdAt,
    ...listing,
  };
}

export function seedListings(): Listing[] {
  return mockHouses.map(withAdminDefaults);
}

export async function readStoredListings(): Promise<Listing[] | null> {
  try {
    const raw = await AsyncStorage.getItem(LISTINGS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Listing[];
  } catch {
    return null;
  }
}

export async function writeStoredListings(listings: Listing[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  } catch {
    // Storage can fail (quota, private mode); the in-memory state still works.
  }
}

// A pasted export is only accepted when it looks like a listing array.
export function isListingArray(value: unknown): value is Listing[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((l) => {
    if (!l || typeof l !== 'object') return false;
    const r = l as Record<string, unknown>;
    return (
      typeof r.id === 'string' &&
      typeof r.createdAt === 'string' &&
      typeof r.priceUsd === 'number' &&
      Array.isArray(r.photos) &&
      typeof r.city === 'string' &&
      typeof r.type === 'string'
    );
  });
}
