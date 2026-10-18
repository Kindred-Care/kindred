import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fontAssets } from '@/design/fonts';

// Keep the native launch screen (Warm White, no artwork) up until Inter is ready, so the first
// Kindred frame is drawn in the right typeface.
NativeSplash.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  const ready = loaded || error !== null;

  useEffect(() => {
    if (error) console.warn('Inter failed to load; the system font is used instead.');
    if (ready) NativeSplash.hideAsync().catch(() => undefined);
  }, [ready, error]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
