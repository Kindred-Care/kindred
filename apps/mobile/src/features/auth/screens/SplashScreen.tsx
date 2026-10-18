import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, space, splashDurationMs } from '@/design/theme';
import { Brand } from '../components/Brand';

export const SPLASH_DURATION_MS = splashDurationMs;

/**
 * Brand splash, then Log In (design brief section 2): Warm White, the "Kindred" wordmark and the
 * tagline centred horizontally at the Mobile – Splash frame's height, never above the safe area. The
 * decorative botanical leaves are deferred and no artwork stands in for them.
 */
export function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/log-in'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: Math.max(0, space.brandTopSplash - insets.top) }]}
      edges={['top', 'bottom', 'left', 'right']}
      testID="splash"
    >
      <Brand color={colors.textOnSplash} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: space.screenMarginStart,
    paddingRight: space.screenMarginEnd,
    backgroundColor: colors.splash,
  },
});
