import { StyleSheet } from 'react-native';
import { colors, fonts } from './index';

/** Estilos de texto reutilizados pelas telas (títulos em Big Shoulders Display, corpo em Geist). */
export const typography = StyleSheet.create({
  hero: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.text },
  title: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: fonts.displayExtraBold, fontSize: 18, color: colors.text },
  section: { fontFamily: fonts.displayBlack, fontSize: 18, color: colors.textMuted, textTransform: 'uppercase' },
  subtitle: { fontFamily: fonts.displayExtraBold, fontSize: 16, color: colors.text },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  price: { fontFamily: fonts.displayBlack, fontSize: 18, color: colors.accent },
  link: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.accent, textDecorationLine: 'underline' },
});
