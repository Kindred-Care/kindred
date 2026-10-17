import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, space, touchTarget, type } from '@/design/theme';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  label: string;
  hint?: string;
};

/**
 * A text field with its label above it, not beside it, so it survives 200% dynamic type and screen
 * readers announce it correctly (mockup observation 2). No fixed heights anywhere.
 */
export function LabeledTextField({ label, hint, onFocus, onBlur, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label} nativeID={`${label}-label`}>
        {label}
      </Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={hint}
        aria-labelledby={`${label}-label`}
        placeholderTextColor={colors.textPlaceholder}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: space.sm,
  },
  label: {
    ...type.label,
    color: colors.textPrimary,
  },
  input: {
    ...type.body,
    color: colors.textPrimary,
    backgroundColor: colors.input,
    borderColor: colors.borderInput,
    borderWidth: 1,
    borderRadius: radius.control,
    minHeight: touchTarget,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    borderWidth: 2,
  },
});
