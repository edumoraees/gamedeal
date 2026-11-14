import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  /** "pill": etiquetas arredondadas da avaliação; "square": filtros e categorias. */
  shape?: 'square' | 'pill';
};

/** Filtro/etiqueta selecionável (filtros de serviços, categorias, tags da avaliação). */
export function Chip({ label, selected = false, onPress, icon, shape = 'square' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.base,
        shape === 'pill' ? styles.pill : styles.square,
        selected ? styles.selected : styles.idle,
        shape === 'pill' && !selected ? styles.pillIdle : null,
      ]}
    >
      {icon}
      <Text style={[styles.text, selected && styles.textSelected, shape === 'pill' && !selected && styles.textPill]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1 },
  square: { borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 7 },
  pill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 8 },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  pillIdle: { backgroundColor: 'transparent', borderColor: colors.accent },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontFamily: fonts.displayExtraBold, fontSize: 13, color: colors.text, textTransform: 'uppercase' },
  textSelected: { color: colors.onAccent },
  textPill: { color: colors.accent, textTransform: 'none' },
});
