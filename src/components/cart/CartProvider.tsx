"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { Product } from "@/data/products";
import { getProductById, gstComponent } from "@/lib/products";

const STORAGE_KEY = "hcw-cart-v1";
const MAX_QTY_PER_LINE = 20;

export type CartItem = { id: string; qty: number };

export type CartLine = {
  product: Product;
  qty: number;
  lineTotal: number;
};

type CartTotals = {
  count: number;
  subtotal: number;
  gstIncluded: number;
  total: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  totals: CartTotals;
  hydrated: boolean;
  isOpen: boolean;
  addItem: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.round(qty)));
}

/* -------------------------------------------------------------------------- */
/*  Module-level store — a single source of truth for the cart, bound to       */
/*  localStorage and consumed via useSyncExternalStore (SSR-safe, no effects). */
/* -------------------------------------------------------------------------- */

const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const next = parsed
      .filter(
        (it): it is CartItem =>
          typeof it === "object" &&
          it !== null &&
          typeof (it as CartItem).id === "string"
      )
      // Drop ids that are no longer in the catalogue.
      .filter((it) => Boolean(getProductById(it.id)))
      .map((it) => ({ id: it.id, qty: clampQty(it.qty) }));
    return next.length > 0 ? next : EMPTY;
  } catch {
    return EMPTY;
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  items = readStorage();
  initialized = true;
  // The store is a module singleton, so a single cross-tab listener (not one
  // per subscriber) is enough and lives for the app's lifetime.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      items = readStorage();
      emit();
    }
  });
}

function emit() {
  for (const listener of listeners) listener();
}

function sameItems(a: CartItem[], b: CartItem[]): boolean {
  return (
    a.length === b.length &&
    a.every((it, i) => it.id === b[i].id && it.qty === b[i].qty)
  );
}

function commit(next: CartItem[]) {
  if (sameItems(items, next)) return;
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable — cart still works in-session */
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getItemsSnapshot = () => items;
const getItemsServerSnapshot = () => EMPTY;
const getHydratedSnapshot = () => initialized;
const getHydratedServerSnapshot = () => false;

function mutateAdd(id: string, qty: number) {
  if (!getProductById(id)) return;
  const existing = items.find((it) => it.id === id);
  commit(
    existing
      ? items.map((it) =>
          it.id === id ? { ...it, qty: clampQty(it.qty + qty) } : it
        )
      : [...items, { id, qty: clampQty(qty) }]
  );
}

function mutateSetQty(id: string, qty: number) {
  commit(
    qty <= 0
      ? items.filter((it) => it.id !== id)
      : items.map((it) =>
          it.id === id ? { ...it, qty: clampQty(qty) } : it
        )
  );
}

function mutateRemove(id: string) {
  commit(items.filter((it) => it.id !== id));
}

function mutateClear() {
  commit(EMPTY);
}

/* -------------------------------------------------------------------------- */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const currentItems = useSyncExternalStore(
    subscribe,
    getItemsSnapshot,
    getItemsServerSnapshot
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((id: string, qty = 1) => {
    mutateAdd(id, qty);
    setIsOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    mutateSetQty(id, qty);
  }, []);
  const removeItem = useCallback((id: string) => mutateRemove(id), []);
  const clear = useCallback(() => mutateClear(), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const lines = useMemo<CartLine[]>(() => {
    return currentItems.flatMap((it) => {
      const product = getProductById(it.id);
      if (!product) return [];
      return [
        {
          product,
          qty: it.qty,
          lineTotal: Math.round(product.price * it.qty * 100) / 100,
        },
      ];
    });
  }, [currentItems]);

  const totals = useMemo<CartTotals>(() => {
    const subtotal =
      Math.round(lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100;
    return {
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      gstIncluded: Math.round(gstComponent(subtotal) * 100) / 100,
      total: subtotal,
    };
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: currentItems,
      lines,
      totals,
      hydrated,
      isOpen,
      addItem,
      setQty,
      removeItem,
      clear,
      openCart,
      closeCart,
    }),
    [
      currentItems,
      lines,
      totals,
      hydrated,
      isOpen,
      addItem,
      setQty,
      removeItem,
      clear,
      openCart,
      closeCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
