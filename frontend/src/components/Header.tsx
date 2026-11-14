import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { typography } from '@/theme/typography';

type Props = {
  title: string;
  /** Título centralizado com seta de voltar (padrão das telas internas do Figma). */
  centered?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** Botão de voltar em círculo (tela de detalhe do item e carrinho). */
  roundBack?: boolean;
};

export function Header({ title, centered = true, showBack = true, onBack, right, roundBack = false }: Props) {
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={roundBack ? styles.roundButton : undefined}
          >
            <ArrowLeft color={colors.text} size={22} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[typography.headerTitle, centered ? styles.centerTitle : styles.leftTitle]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

/** Título grande alinhado à esquerda (Painel de Vendas, Serviços Gaming). */
export function PageTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.pageRow}>
      <Text style={typography.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, minHeight: 64 },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  centerTitle: { flex: 1, textAlign: 'center' },
  leftTitle: { flex: 1 },
  roundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
});
