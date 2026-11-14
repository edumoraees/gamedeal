import type { ListingCategory, ListingStatus, OrderStatus } from '@/types/api';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoney(value: number | null | undefined, currency = 'BRL'): string {
  const amount = Number(value ?? 0);
  if (currency === 'BRL') return brl.format(amount);
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function memberSinceYear(iso?: string | null): string {
  return iso ? String(new Date(iso).getFullYear()) : '';
}

/** "1249,99" ou "1249.99" -> 1249.99 */
export function parseMoneyInput(text: string): number {
  const normalized = text.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}

export const categoryLabels: Record<ListingCategory, string> = {
  ARMA: 'Armas',
  SKIN: 'Skins',
  MOEDA: 'Moedas',
  CONTA: 'Contas',
  SERVICO: 'Serviços',
};

export const listingStatusLabels: Record<ListingStatus, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  SOLD_OUT: 'Esgotado',
  REMOVED: 'Removido',
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  PAID: 'No cofre',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
