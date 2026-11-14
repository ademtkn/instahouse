import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_KEY, favoritesKey } from '../constants/storage';

// Phase 1 "account": a name and a phone number kept on the device. Its only
// job is to own the favourites list. Phase 2 swaps this for Supabase auth
// (SMS code) without changing the screens.
export interface User {
  name: string;
  phone: string; // digits only, e.g. 996502001903
  email?: string;
  notifications: boolean; // price drops on favourites, new listings (phase 2)
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  signIn: (u: User) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: () => void;
  // Run `then` now if signed in, otherwise open the sign-in sheet and run it after
  // sign-in. The user is passed in because callers' closures predate the sign-in.
  requireAuth: (then?: (u: User) => void) => void;
  sheetVisible: boolean;
  dismissSheet: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export const normalizePhone = (raw: string) => raw.replace(/\D/g, '');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const pending = useRef<((u: User) => void) | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((raw) => {
        if (!raw) return;
        // Older builds stored a password field; it is ignored and never used.
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const phone = typeof parsed.phone === 'string' ? parsed.phone : '';
        if (!phone) return;
        const user: User = {
          name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : 'InstaHouse',
          phone,
          email: typeof parsed.email === 'string' ? parsed.email : undefined,
          notifications: typeof parsed.notifications === 'boolean' ? parsed.notifications : true,
        };
        setUser(user);
        // Migrate old accounts: drop the legacy plaintext password from storage.
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback((u: User) => {
    setUser(u);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(u)).catch(() => {});
    setSheetVisible(false);
    const then = pending.current;
    pending.current = null;
    then?.(u);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(USER_KEY).catch(() => {});
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(USER_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Removes the account and the favourites stored under it on this device.
  const deleteAccount = useCallback(() => {
    if (user) AsyncStorage.removeItem(favoritesKey(user.phone)).catch(() => {});
    setUser(null);
    AsyncStorage.removeItem(USER_KEY).catch(() => {});
  }, [user]);

  const requireAuth = useCallback(
    (then?: (u: User) => void) => {
      if (user) {
        then?.(user);
        return;
      }
      pending.current = then ?? null;
      setSheetVisible(true);
    },
    [user],
  );

  const dismissSheet = useCallback(() => {
    pending.current = null;
    setSheetVisible(false);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, signIn, signOut, updateUser, deleteAccount, requireAuth, sheetVisible, dismissSheet }),
    [user, ready, signIn, signOut, updateUser, deleteAccount, requireAuth, sheetVisible, dismissSheet],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
