import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  /** Conteúdo rolável (padrão). Use false quando a tela tiver FlatList própria. */
  scroll?: boolean;
  /** Área fixa no rodapé (ex.: botão "Avançar"). */
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  padded?: boolean;
};

/** Estrutura base de todas as telas: fundo escuro, área segura, rolagem e teclado. */
export function Screen({
  children,
  scroll = true,
  footer,
  refreshing,
  onRefresh,
  edges = ['top'],
  contentStyle,
  padded = true,
}: Props) {
  const padding = padded ? styles.padded : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[padding, styles.scrollContent, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padding, contentStyle]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.xl },
  scrollContent: { paddingBottom: spacing.xxl, flexGrow: 1 },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
});
