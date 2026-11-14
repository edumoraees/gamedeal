/**
 * Design tokens extraídos do Figma do GameDeal.
 * Todas as telas usam estes valores, nunca cores/tamanhos soltos.
 */
export const colors = {
  background: '#0B0E14',
  surface: '#161A24',
  surfaceAlt: '#1B2130',
  border: '#252B3A',
  text: '#FFFFFF',
  textMuted: '#8A94A6',
  accent: '#00FFCC',
  accentDark: '#00C9A1',
  onAccent: '#0B0E14',
  pink: '#FF007F',
  magenta: '#FF07FF',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#FF4D6D',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const fonts = {
  displayBlack: 'BigShouldersDisplay_900Black',
  displayExtraBold: 'BigShouldersDisplay_800ExtraBold',
  displayBold: 'BigShouldersDisplay_700Bold',
  body: 'Geist_400Regular',
  bodyMedium: 'Geist_500Medium',
  bodySemiBold: 'Geist_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

/** Brilho neon usado nos botões principais do Figma. */
export const glow = {
  shadowColor: colors.accent,
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
} as const;
