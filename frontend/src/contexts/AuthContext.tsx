import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import { setUnauthorizedHandler } from '@/services/api';
import { tokenStorage } from '@/services/tokenStorage';
import type { User } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  /** true enquanto verifica se existe sessão salva (ao abrir o app). */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  // Restaura a sessão: se houver token salvo, busca o usuário em /ws/auth/me.
  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.get();
        if (token) setUser(await authService.me());
      } catch {
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Token expirado em qualquer chamada protegida -> volta para o login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await authService.signin(email.trim(), password);
    await tokenStorage.set(response.token);
    setUser(response.user);
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      await authService.signup(username.trim(), email.trim(), password);
      await signIn(email, password);
    },
    [signIn],
  );

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
