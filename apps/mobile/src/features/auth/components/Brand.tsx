import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
  // Android's shrink-to-fit draws the 64 pt wordmark about 2% small even when it fits, which puts it
  // outside the Figma tolerance. At the default text size the 226 pt wordmark always fits a phone's
  // width, so shrinking is only switched on when the system text size is enlarged.
  const { fontScale } = useWindowDimensions();

  return (
    <View style={styles.brand}>
      <Text
        accessibilityRole="header"
        style={[styles.wordmark, { color }]}
        maxFontSizeMultiplier={wordmarkMaxScale}
        numberOfLines={1}
        adjustsFontSizeToFit={fontScale > 1}
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
    alignSelf: 'stretch',
  },
  wordmark: {
    ...type.wordmark,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  // A margin rather than a gap: the frame's spacing is slightly negative between the two line boxes.
  tagline: {
    ...type.tagline,
    marginTop: space.brandGap,
    textAlign: 'center',
  },
});
