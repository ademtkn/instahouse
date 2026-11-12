import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Currency } from '../utils/format';

export type { Currency };
export const CURRENCIES: Currency[] = ['usd', 'som'];

const KEY = 'instahouse.currency.v1';

interface CurrencyValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('usd');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'usd' || v === 'som') setCurrencyState(v);
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    AsyncStorage.setItem(KEY, c).catch(() => {});
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
