import { request } from './api';
import type { PublicUser, SigninResponse, User } from '@/types/api';

/** auth-service (via Gateway): /auth/** público e /ws/auth/** protegido. */
export const authService = {
  signin: (email: string, password: string) =>
    request<SigninResponse>('/auth/signin', { method: 'POST', body: { email, password } }),

  signup: (username: string, email: string, password: string) =>
    request<User>('/auth/signup', { method: 'POST', body: { username, email, password } }),

  me: () => request<User>('/ws/auth/me'),

  publicProfile: (userId: number) => request<PublicUser>(`/auth/users/${userId}`),
};
