import type { ExpoConfig } from 'expo/config';

import designTokens from '../../design/tokens/tokens.json';

// The native splash uses the same token as the in-app splash, so there is no second copy of the
// colour to drift.
const splashBackground = designTokens.color.brand.apricot.$value;

// Placeholder identifiers. Confirm them before the first store submission: they cannot change
// afterwards (ADR 0013).
const bundleIdentifier = 'com.kindredcare.mobile';

const config: ExpoConfig = {
  name: 'Kindred',
  slug: 'kindred',
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
  plugins: ['expo-router', 'expo-dev-client', ['expo-splash-screen', { backgroundColor: splashBackground }]],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
