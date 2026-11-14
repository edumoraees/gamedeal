import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';

export type TextFieldRef = ComponentRef<typeof TextInput>;

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  required?: boolean;
};

/** Campo de texto com rótulo e mensagem de erro (padrão dos formulários do Figma). */
export const TextField = forwardRef<ComponentRef<typeof TextInput>, Props>(function TextField(
  { label, error, required, style, multiline, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error ? styles.inputError : null,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...typography.label },
  input: {
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  multiline: { height: 80, paddingTop: spacing.md },
  focused: { borderColor: colors.accent },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.danger },
});
