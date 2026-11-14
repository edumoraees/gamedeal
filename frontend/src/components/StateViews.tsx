import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { Button } from './Button';

/** Carregando (tela ou bloco). */
export function LoadingView({ message = 'Carregando...' }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={typography.muted}>{message}</Text>
    </View>
  );
}

/** Erro com botão de tentar novamente. */
export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={[typography.subtitle, styles.text]}>Ops! Algo deu errado</Text>
      <Text style={[typography.muted, styles.text]}>{message}</Text>
      {onRetry ? <Button title="Tentar novamente" variant="outline" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

/** Lista vazia. */
export function EmptyView({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <Text style={[typography.subtitle, styles.text]}>{title}</Text>
      {message ? <Text style={[typography.muted, styles.text]}>{message}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
  },
  text: { textAlign: 'center' },
});
