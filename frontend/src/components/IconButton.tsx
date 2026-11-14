import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme';

/** Botão redondo só com ícone (busca, notificações, compartilhar, lixeira). */
export function IconButton({
  children,
  onPress,
  label,
  size = 36,
}: {
  children: ReactNode;
  onPress?: () => void;
  label: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
