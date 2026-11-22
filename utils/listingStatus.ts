import type { Listing } from '../types/listing';
import { isLive } from './time';

// The feed only shows listings the admin has left active, marked as paid and
// which are still inside the 15-day lifetime. Demo rows (no status/paid fields)
// count as active + paid so the seeded catalogue keeps working.
export const isActive = (l: Listing) => (l.status ?? 'active') === 'active';
export const isPaid = (l: Listing) => l.paid !== false;
export const isExpired = (l: Listing) => !isLive(l.createdAt);
export const isPublished = (l: Listing) => isActive(l) && isPaid(l) && !isExpired(l);

export const publishedListings = (listings: Listing[]) => listings.filter(isPublished);
