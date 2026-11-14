import { request } from './api';
import type { Dashboard, Order, Quote, Review, ReviewInput, SellerSummary } from '@/types/api';

/** order-service (via Gateway): pedidos, painel de vendas e reputação. */
export const orderService = {
  quote: (listingId: number, quantity: number) =>
    request<Quote>('/ws/orders/quote', { query: { listingId, quantity } }),

  create: (listingId: number, quantity: number) =>
    request<Order>('/ws/orders', { method: 'POST', body: { listingId, quantity } }),

  myPurchases: () => request<Order[]>('/ws/orders'),

  mySales: () => request<Order[]>('/ws/orders/sales'),

  dashboard: () => request<Dashboard>('/ws/orders/dashboard'),

  findById: (id: number) => request<Order>(`/ws/orders/${id}`),

  confirmReceipt: (id: number) => request<Order>(`/ws/orders/${id}/confirm`, { method: 'POST' }),

  review: (orderId: number, input: ReviewInput) =>
    request<Review>(`/ws/orders/${orderId}/review`, { method: 'POST', body: input }),

  sellerSummary: (sellerId: number) => request<SellerSummary>(`/sellers/${sellerId}/summary`),

  sellerReviews: (sellerId: number) => request<Review[]>(`/sellers/${sellerId}/reviews`),
};
