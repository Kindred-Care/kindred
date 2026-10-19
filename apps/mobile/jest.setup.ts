// The safe-area library's own Jest mock: zero insets, no native module.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
