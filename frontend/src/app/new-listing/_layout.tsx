import { Stack } from 'expo-router';
import { NewListingProvider } from '@/contexts/NewListingContext';
import { colors } from '@/theme';

/** Fluxo de criação/edição de anúncio, com o rascunho compartilhado entre as etapas. */
export default function NewListingLayout() {
  return (
    <NewListingProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </NewListingProvider>
  );
}
