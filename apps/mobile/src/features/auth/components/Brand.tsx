import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type, wordmarkMaxScale } from '@/design/theme';

export const TAGLINE = 'Care for Every Chapter.';

type Props = {
  /** Text colour for the surface the brand sits on. */
  color?: string;
};

/**
 * The "Kindred" wordmark with the tagline beneath it, centred, as on the splash and Log In frames.
 * No leaf logo or decorative artwork: the apricot botanical leaves are deferred (design brief).
 *
 * The wordmark grows with the system text size up to 1.5x and then shrinks to fit its single line;
 * the tagline scales fully, wraps and is never truncated.
 */
export function Brand({ color = colors.textPrimary }: Props) {
  return (
    <View style={styles.brand}>
      <Text
        accessibilityRole="header"
        style={[styles.wordmark, { color }]}
        maxFontSizeMultiplier={wordmarkMaxScale}
        numberOfLines={1}
        adjustsFontSizeToFit
        testID="brand-wordmark"
      >
        Kindred
      </Text>
      <Text style={[styles.tagline, { color }]} testID="brand-tagline">
        {TAGLINE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    gap: space.brandGap,
    alignSelf: 'stretch',
  },
  wordmark: {
    ...type.wordmark,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tagline: {
    ...type.tagline,
    textAlign: 'center',
  },
});
