import { Stack } from 'expo-router';
import { colors } from '@/theme';

/** Abre o login como primeira tela do grupo (auth). */
export const unstable_settings = { initialRouteName: 'login' };

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
  );
}
