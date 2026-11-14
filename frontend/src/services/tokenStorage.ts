import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Guarda o JWT de forma segura: SecureStore (Keychain/Keystore) no celular
 * e AsyncStorage (localStorage) no navegador, onde o SecureStore não existe.
 */
const TOKEN_KEY = 'gamedeal.token';
const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return isWeb ? await AsyncStorage.getItem(TOKEN_KEY) : await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    if (isWeb) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    try {
      if (isWeb) await AsyncStorage.removeItem(TOKEN_KEY);
      else await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // nada a limpar
    }
  },
};
