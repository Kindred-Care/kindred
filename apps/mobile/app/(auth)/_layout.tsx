import { Stack } from 'expo-router';

/** Public route group: splash, log in and (from Phase 2) password reset. Section 3, Refinement 1. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
