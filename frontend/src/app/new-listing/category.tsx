import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Coins, Gamepad2, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react-native';
import { Card, Header, Screen } from '@/components';
import { useNewListing } from '@/contexts/NewListingContext';
import type { ListingCategory } from '@/types/api';
import { colors, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { categoryLabels } from '@/utils/format';

const options: { category: ListingCategory; icon: LucideIcon }[] = [
  { category: 'ARMA', icon: Swords },
  { category: 'SKIN', icon: Sparkles },
  { category: 'MOEDA', icon: Coins },
  { category: 'CONTA', icon: Gamepad2 },
  { category: 'SERVICO', icon: Zap },
];

/** Etapa 1 do anúncio: "Selecione a categoria". */
export default function CategoryScreen() {
  const { reset, update } = useNewListing();

  // Começa sempre um rascunho novo ao abrir o fluxo.
  useEffect(() => {
    reset();
  }, [reset]);

  function choose(category: ListingCategory) {
    update({ category });
    router.push('/new-listing/details');
  }

  return (
    <Screen>
      <Header title="Novo Anúncio" />
      <Text style={typography.title}>Selecione a categoria</Text>
      <Text style={[typography.muted, styles.subtitle]}>Escolha o tipo de produto que deseja anunciar</Text>

      <View style={styles.list}>
        {options.map(({ category, icon: Icon }) => (
          <Card key={category} style={styles.row} onPress={() => choose(category)} accessibilityLabel={categoryLabels[category]}>
            <View style={styles.iconBox}>
              <Icon color={colors.onAccent} size={18} />
            </View>
            <Text style={[typography.subtitle, styles.label]}>{categoryLabels[category]}</Text>
            <ChevronRight color={colors.textMuted} size={18} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, marginBottom: spacing.lg },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.lg },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
});
