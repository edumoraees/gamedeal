import Constants from 'expo-constants';
import { Platform } from 'react-native';

const GATEWAY_PORT = 8080;

/**
 * Endereço do API Gateway (único ponto de entrada do backend).
 *
 * 1) Se EXPO_PUBLIC_API_URL estiver definido no .env do app, ele é usado.
 * 2) Senão, usamos o IP da máquina que está rodando o Expo (o mesmo que o celular já
 *    usa para baixar o app). Assim o Expo Go funciona sem configurar IP na mão.
 * 3) No navegador ou emulador sem hostUri, cai para localhost / 10.0.2.2.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri; // ex.: "192.168.0.15:8081"
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${GATEWAY_PORT}`;
  }

  if (Platform.OS === 'android') return `http://10.0.2.2:${GATEWAY_PORT}`;
  return `http://localhost:${GATEWAY_PORT}`;
}

export const API_URL = resolveApiUrl();

/** Tempo máximo de espera por resposta da API (ms). */
export const REQUEST_TIMEOUT_MS = 15000;

/** Imagens enviadas pelo app voltam como "/images/x.jpg": completa com o endereço do Gateway. */
export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
