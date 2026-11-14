import { Platform } from 'react-native';
import { request } from './api';
import type { Game, Listing, ListingCategory, ListingInput, ListingStatus, Page } from '@/types/api';

export type ListingFilters = {
  category?: ListingCategory;
  gameId?: number;
  sellerId?: number;
  subcategory?: string;
  search?: string;
  currency?: string;
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  size?: number;
};

/** catalog-service (via Gateway): anúncios, jogos e fotos. */
export const catalogService = {
  games: () => request<Game[]>('/games'),

  search: (filters: ListingFilters = {}) => request<Page<Listing>>('/listings', { query: filters }),

  findById: (id: number, currency?: string) => request<Listing>(`/listings/${id}`, { query: { currency } }),

  mine: () => request<Listing[]>('/ws/listings/mine'),

  create: (input: ListingInput) => request<Listing>('/ws/listings', { method: 'POST', body: input }),

  update: (id: number, input: ListingInput) => request<Listing>(`/ws/listings/${id}`, { method: 'PUT', body: input }),

  changeStatus: (id: number, status: Extract<ListingStatus, 'ACTIVE' | 'PAUSED'>) =>
    request<Listing>(`/ws/listings/${id}/status`, { method: 'PATCH', body: { status } }),

  remove: (id: number) => request<void>(`/ws/listings/${id}`, { method: 'DELETE' }),

  /** Envia uma foto escolhida na galeria e devolve a URL relativa salva pelo backend. */
  async uploadImage(uri: string, mimeType = 'image/jpeg'): Promise<string> {
    const form = new FormData();
    const extension = mimeType.split('/')[1] ?? 'jpg';
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      form.append('file', blob, `foto.${extension}`);
    } else {
      // No React Native o FormData aceita { uri, name, type } para arquivos locais.
      form.append('file', { uri, name: `foto.${extension}`, type: mimeType } as unknown as Blob);
    }
    const result = await request<{ url: string }>('/ws/listings/images', { method: 'POST', formData: form });
    return result.url;
  },
};
