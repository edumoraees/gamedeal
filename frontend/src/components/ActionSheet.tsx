import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  onClose: () => void;
};

/** Menu de ações que sobe do rodapé (funciona igual no Android, iOS e web). */
export function ActionSheet({ visible, title, subtitle, options, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar menu" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {title ? (
          <Text style={typography.subtitle} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? <Text style={typography.small}>{subtitle}</Text> : null}
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.label}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.optionText, option.destructive && styles.destructive]}>{option.label}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.option, styles.cancel]} onPress={onClose} accessibilityRole="button">
            <Text style={[styles.optionText, styles.cancelText]}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: 4,
  },
  options: { marginTop: spacing.md, gap: spacing.sm },
  option: {
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  optionText: { fontFamily: fonts.displayExtraBold, fontSize: 16, color: colors.text },
  destructive: { color: colors.danger },
  cancel: { backgroundColor: 'transparent' },
  cancelText: { color: colors.textMuted },
});
