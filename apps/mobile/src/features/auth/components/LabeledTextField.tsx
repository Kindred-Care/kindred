import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, size, space, touchTarget, type } from '@/design/theme';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'placeholder'> & {
  /** The visible label, as in Figma, for example "Username:". */
  label: string;
  /** What screen readers announce for the field, for example "Username". */
  accessibilityLabel: string;
  /** Labels sit beside their fields unless they no longer fit (see `shouldStackLabels`). */
  stacked: boolean;
  /** Width beside the label, shared by every field on the screen so they stay aligned (`fieldWidthFor`). */
  fieldWidth?: number;
};

/**
 * A text field with its visible label to the left and the field at the right edge (the Figma frame:
 * label at x 32, a 199 pt field ending at x 371), or the label above it when the text is enlarged or
 * the screen is narrow, so nothing is clipped. Screen readers announce the field
 * by its label in either arrangement; the visible label is hidden from them so it is not read twice.
 * There is no placeholder text: the label identifies the field. No fixed heights anywhere.
 */
export function LabeledTextField({
  label,
  accessibilityLabel,
  stacked,
  fieldWidth = size.fieldWidth,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.row, stacked && styles.stacked]} testID={inputProps.testID && `${inputProps.testID}-row`}>
      <Text
        style={[styles.label, !stacked && styles.labelBeside]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {label}
      </Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={accessibilityLabel}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[styles.input, !stacked && { width: fieldWidth }, focused && styles.inputFocused]}
      />
    </View>
  );
}

/**
 * Labels stack above their fields when a label and a field at least `minFieldWidth` wide no longer fit
 * on one line within the margins (design brief section 3 default). Before anything has been measured
 * the reference layout, side by side, is kept.
 */
/**
 * The Figma field width (199 pt), giving way on narrower screens down to `minFieldWidth`, after which the
 * labels stack. Computed from the longest label, so every field gets the same width and right edge.
 */
export function fieldWidthFor(labelWidth: number, availableWidth: number) {
  if (availableWidth <= 0) return size.fieldWidth;
  return Math.max(size.minFieldWidth, Math.min(size.fieldWidth, availableWidth - labelWidth - space.label));
}

export function shouldStackLabels(labelWidth: number, availableWidth: number) {
  if (availableWidth <= 0 || labelWidth <= 0) return false;
  return labelWidth + space.label + size.minFieldWidth > availableWidth;
}

// The border is drawn inside the box (Figma "inside stroke"), so the padding gives way to it and the
// field stays 14 + line height + 14 tall whether it is resting (1 pt) or focused (2 pt).
const inset = (border: number) => ({
  borderWidth: border,
  paddingHorizontal: space.controlPaddingX - border,
  paddingVertical: space.controlPaddingY - border,
});

// Android's TextInput does not size itself from lineHeight, so the field's 14 + 24 + 14 pt height
// (design brief) is set as a minimum; it still grows with larger text.
export const FIELD_MIN_HEIGHT = Math.max(touchTarget, 2 * space.controlPaddingY + type.body.lineHeight);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.label,
  },
  stacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  label: {
    ...type.label,
    color: colors.textPrimary,
  },
  // Sits the label's glyphs where the frame has them in the 52 pt row.
  labelBeside: {
    marginBottom: space.labelRaise,
  },
  input: {
    ...type.body,
    ...inset(size.border),
    color: colors.textPrimary,
    backgroundColor: colors.input,
    borderColor: colors.borderInput,
    borderRadius: radius.control,
    minHeight: FIELD_MIN_HEIGHT,
    textAlignVertical: 'center',
  },
  inputFocused: {
    ...inset(size.borderFocus),
    borderColor: colors.borderFocus,
  },
});
