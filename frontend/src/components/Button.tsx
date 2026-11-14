import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fonts, glow, radius, spacing } from '@/theme';

type Variant = 'primary' | 'outline' | 'secondary' | 'pink' | 'danger';
type Size = 'md' | 'sm';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  /** Texto em caixa alta (botões do tipo "FINALIZE VAULT DEPOSIT"). */
  uppercase?: boolean;
};

/** Botão padrão do app, nas variações vistas no Figma. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  uppercase = false,
}: Props) {
  const isDisabled = disabled || loading;
  const v = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        v.container,
        variant === 'primary' && !isDisabled ? glow : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, size === 'sm' && styles.textSm, v.text, uppercase && styles.upper]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const variants: Record<Variant, { container: ViewStyle; text: { color: string } }> = {
  primary: { container: { backgroundColor: colors.accent }, text: { color: colors.onAccent } },
  outline: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent },
    text: { color: colors.text },
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  pink: { container: { backgroundColor: colors.pink }, text: { color: colors.text } },
  danger: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
    text: { color: colors.danger },
  },
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  md: { height: 48, paddingHorizontal: spacing.xl },
  sm: { height: 36, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { fontFamily: fonts.displayExtraBold, fontSize: 17 },
  textSm: { fontSize: 14 },
  upper: { textTransform: 'uppercase' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});
