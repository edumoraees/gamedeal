import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Game, ListingCategory, ListingInput } from '@/types/api';

/**
 * Rascunho compartilhado entre as telas do fluxo "Novo Anúncio"
 * (categoria -> detalhes -> revisar -> publicado). Também é usado para editar.
 */
export type ListingDraft = {
  editId?: number;
  category?: ListingCategory;
  title: string;
  description: string;
  game?: Game;
  priceText: string;
  quantityText: string;
  subcategory?: string;
  rarity?: string;
  images: string[];
};

const emptyDraft: ListingDraft = {
  title: '',
  description: '',
  priceText: '',
  quantityText: '1',
  images: [],
};

type ContextValue = {
  draft: ListingDraft;
  update: (patch: Partial<ListingDraft>) => void;
  reset: (initial?: Partial<ListingDraft>) => void;
  /** Converte o rascunho no corpo esperado pela API. */
  toInput: (price: number, quantity: number) => ListingInput;
};

const NewListingContext = createContext<ContextValue | undefined>(undefined);

export function NewListingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);

  const update = useCallback((patch: Partial<ListingDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const reset = useCallback((initial?: Partial<ListingDraft>) => setDraft({ ...emptyDraft, ...initial }), []);

  const toInput = useCallback(
    (price: number, quantity: number): ListingInput => ({
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category ?? 'SKIN',
      subcategory: draft.category === 'SERVICO' ? draft.subcategory ?? null : null,
      rarity: draft.category === 'SKIN' || draft.category === 'ARMA' ? draft.rarity ?? null : null,
      gameId: draft.game?.id ?? 0,
      price,
      quantity,
      images: draft.images,
    }),
    [draft],
  );

  const value = useMemo(() => ({ draft, update, reset, toInput }), [draft, update, reset, toInput]);
  return <NewListingContext.Provider value={value}>{children}</NewListingContext.Provider>;
}

export function useNewListing(): ContextValue {
  const ctx = useContext(NewListingContext);
  if (!ctx) throw new Error('useNewListing precisa estar dentro de <NewListingProvider>');
  return ctx;
}
