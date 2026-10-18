import type { ExpoConfig } from 'expo/config';

import designTokens from '../../design/tokens/tokens.json';

// The native launch screen uses the brand colour behind the in-app splash's token (Warm White, no
// artwork), so it hands over to the splash without a colour flash and there is no second copy to drift.
const splashBackground = designTokens.color.brand.warmWhite.$value;

// Placeholder identifiers. Confirm them before the first store submission: they cannot change
// afterwards (ADR 0013).
const bundleIdentifier = 'com.kindredcare.mobile';

const config: ExpoConfig = {
  name: 'Kindred',
  slug: 'kindred',
  // EAS project owner: the founder's Expo organization (free plan). The projectId is added by
  // `eas init` once, under this owner; no other Expo project is created.
  owner: 'kindred-care',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'kindred',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier,
    supportsTablet: false,
  },
  android: {
    package: bundleIdentifier,
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: splashBackground }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
