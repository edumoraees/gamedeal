import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, glow, radius } from '@/theme';

/** Marca "GAMEDEAL" (GAME em verde neon, DEAL em magenta), com ícone opcional. */
export function Logo({ size = 24, withIcon = false }: { size?: number; withIcon?: boolean }) {
  return (
    <View style={styles.row}>
      {withIcon ? (
        <Image
          source={require('../../assets/logo.png')}
          style={[styles.icon, { width: size + 8, height: size + 8 }]}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <Text style={[styles.text, { fontSize: size }]} accessibilityRole="header">
        <Text style={{ color: colors.accent }}>GAME</Text>
        <Text style={{ color: colors.magenta }}>DEAL</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { borderRadius: radius.md, ...glow },
  text: { fontFamily: fonts.displayBlack },
});
