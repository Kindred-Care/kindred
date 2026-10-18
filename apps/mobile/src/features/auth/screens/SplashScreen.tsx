import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space, splashDurationMs } from '@/design/theme';
import { Brand } from '../components/Brand';

export const SPLASH_DURATION_MS = splashDurationMs;

/**
 * Brand splash, then Log In (design brief section 2): Warm White, the "Kindred" wordmark and the
 * tagline centred. The decorative botanical leaves are deferred and no artwork stands in for them.
 */
export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/log-in'), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']} testID="splash">
      <Brand color={colors.textOnSplash} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.screenMargin,
    backgroundColor: colors.splash,
  },
});
