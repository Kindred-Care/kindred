import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '@/design/theme';

export const SPLASH_DURATION_MS = 1500;

/**
 * Brand splash, then Log In. A text wordmark stands in for the logo until the approved artwork is
 * exported from Figma (no mockup images are copied into the repository). Dark text on apricot is
 * used because white on apricot fails contrast (mockup observation 1). Splash copy beyond the name
 * waits for the approved mockup.
 */
export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/log-in'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container} testID="splash">
      <Text accessibilityRole="header" style={styles.wordmark}>
        Kindred
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.lg,
    backgroundColor: colors.splash,
  },
  wordmark: {
    ...type.wordmark,
    color: colors.textOnSplash,
    textAlign: 'center',
  },
});
