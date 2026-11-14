import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';

type Tone = 'accent' | 'pink' | 'muted' | 'success' | 'warning';

const tones: Record<Tone, string> = {
  accent: colors.accent,
  pink: colors.pink,
  muted: colors.textMuted,
  success: colors.success,
  warning: colors.warning,
};

/** Etiqueta com borda neon (ex.: "LEGENDARY", "COUNTER-STRIKE 2", "ATIVO"). */
export function Tag({ label, tone = 'accent', filled = false }: { label: string; tone?: Tone; filled?: boolean }) {
  const color = tones[tone];
  return (
    <View style={[styles.tag, { borderColor: color }, filled && { backgroundColor: color }]}>
      <Text style={[styles.text, { color: filled ? colors.onAccent : color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.overlay,
  },
  text: { fontFamily: fonts.displayExtraBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.3 },
});
