import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Listing } from '@/types/api';

/** Item do carrinho ("The Vault Coffer"): uma cópia do anúncio + quantidade escolhida. */
export type CartItem = {
  listing: Listing;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (listing: Listing, quantity?: number) => void;
  setQuantity: (listingId: number, quantity: number) => void;
  remove: (listingId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = 'gamedeal.cart';
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Carrega o carrinho salvo no aparelho.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  // Salva a cada alteração (depois de carregar, para não sobrescrever com vazio).
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
  }, [items, hydrated]);

  const add = useCallback((listing: Listing, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.listing.id === listing.id);
      if (existing) {
        const next = Math.min(existing.quantity + quantity, listing.quantity);
        return current.map((i) => (i.listing.id === listing.id ? { listing, quantity: next } : i));
      }
      return [...current, { listing, quantity: Math.min(quantity, listing.quantity) }];
    });
  }, []);

  const setQuantity = useCallback((listingId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((i) => (i.listing.id === listingId ? { ...i, quantity: Math.min(quantity, i.listing.quantity) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((listingId: number) => {
    setItems((current) => current.filter((i) => i.listing.id !== listingId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0);
    return { items, count, subtotal, add, setQuantity, remove, clear };
  }, [items, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return ctx;
}
