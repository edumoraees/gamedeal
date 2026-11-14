import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_800ExtraBold,
  BigShouldersDisplay_900Black,
} from '@expo-google-fonts/big-shoulders-display';
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Navegação raiz. Rotas protegidas (Stack.Protected):
 *  - sem login: só login e cadastro;
 *  - com login: abas e telas internas.
 * Trocar o estado de autenticação já redireciona automaticamente.
 */
function RootNavigator() {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!isLoggedIn} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listings" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="new-listing" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="review/[orderId]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BigShouldersDisplay_700Bold,
    BigShouldersDisplay_800ExtraBold,
    BigShouldersDisplay_900Black,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
