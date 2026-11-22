import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Listing } from '../types/listing';
import { readStoredListings, seedListings, writeStoredListings } from '../services/listingStore';

interface ListingsValue {
  listings: Listing[] | null; // null until the store has loaded
  ready: boolean;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  removeListing: (id: string) => void;
  renewListing: (id: string) => void;
  replaceListings: (listings: Listing[]) => void;
}

const ListingsContext = createContext<ListingsValue | null>(null);

// Owns the whole catalogue on this device. The feed, favourites and the admin
// panel all read from here, so an admin edit shows up without a reload.
export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[] | null>(null);
  // Avoid writing the seed twice when two effects race on first load.
  const seeded = useRef(false);

  useEffect(() => {
    let alive = true;
    readStoredListings()
      .then((stored) => {
        if (!alive) return;
        if (stored && stored.length > 0) {
          setListings(stored);
          return;
        }
        if (seeded.current) return;
        seeded.current = true;
        const seed = seedListings();
        setListings(seed);
        writeStoredListings(seed);
      })
      .catch(() => {
        if (!alive) return;
        const seed = seedListings();
        setListings(seed);
      });
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback((next: Listing[]) => {
    setListings(next);
    writeStoredListings(next);
  }, []);

  const addListing = useCallback(
    (listing: Listing) => {
      setListings((prev) => {
        const next = [listing, ...(prev ?? [])];
        writeStoredListings(next);
        return next;
      });
    },
    [],
  );

  const updateListing = useCallback((id: string, patch: Partial<Listing>) => {
    setListings((prev) => {
      if (!prev) return prev;
      const next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      writeStoredListings(next);
      return next;
    });
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => {
      if (!prev) return prev;
      const next = prev.filter((l) => l.id !== id);
      writeStoredListings(next);
      return next;
    });
  }, []);

  // Renewing rewrites the posting date, which restarts the 15-day lifetime.
  const renewListing = useCallback(
    (id: string) => {
      updateListing(id, { createdAt: new Date().toISOString() });
    },
    [updateListing],
  );

  const replaceListings = useCallback(
    (next: Listing[]) => {
      commit(next);
    },
    [commit],
  );

  const value = useMemo<ListingsValue>(
    () => ({
      listings,
      ready: listings !== null,
      addListing,
      updateListing,
      removeListing,
      renewListing,
      replaceListings,
    }),
    [listings, addListing, updateListing, removeListing, renewListing, replaceListings],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used inside ListingsProvider');
  return ctx;
}
