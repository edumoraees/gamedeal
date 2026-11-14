/** Tipos das respostas da API (espelham os DTOs dos microservices). */

export type User = {
  id: number;
  username: string;
  email: string;
  type: string;
  createdAt: string;
};

export type PublicUser = {
  id: number;
  username: string;
  memberSince: string;
};

export type SigninResponse = {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
};

export type Game = {
  id: number;
  name: string;
  slug: string;
};

export type ListingCategory = 'ARMA' | 'SKIN' | 'MOEDA' | 'CONTA' | 'SERVICO';
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'REMOVED';

export type Listing = {
  id: number;
  sellerId: number;
  sellerName: string;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory: string | null;
  rarity: string | null;
  game: Game;
  price: number;
  quantity: number;
  soldCount: number;
  status: ListingStatus;
  images: string[];
  platformFee: number;
  sellerReceives: number;
  displayPrice: number;
  displayCurrency: string;
  createdAt: string;
};

export type ListingInput = {
  title: string;
  description: string;
  category: ListingCategory;
  subcategory?: string | null;
  rarity?: string | null;
  gameId: number;
  price: number;
  quantity: number;
  images: string[];
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type OrderStatus = 'PAID' | 'COMPLETED' | 'CANCELLED';

export type Order = {
  id: number;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  listingId: number;
  listingTitle: string;
  listingImage: string | null;
  category: ListingCategory;
  gameName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  sellerNet: number;
  status: OrderStatus;
  reviewed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type Quote = {
  listingId: number;
  title: string;
  image: string | null;
  sellerName: string;
  gameName: string;
  unitPrice: number;
  quantity: number;
  available: number;
  subtotal: number;
  serviceFee: number;
  serviceFeeRate: number;
  total: number;
};

export type Dashboard = {
  completedSales: number;
  pendingSales: number;
  revenue: number;
  pendingBalance: number;
  completedPurchases: number;
};

export type SellerSummary = {
  sellerId: number;
  averageRating: number;
  reviewCount: number;
  positivePercent: number;
  completedSales: number;
};

export type Review = {
  id: number;
  orderId: number;
  sellerId: number;
  buyerId: number;
  buyerName: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
};

export type ReviewInput = {
  rating: number;
  comment?: string;
  tags: string[];
};

/** Formato padrão de erro devolvido por todos os microservices e pelo Gateway. */
export type ApiErrorBody = {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  details?: string[];
};
