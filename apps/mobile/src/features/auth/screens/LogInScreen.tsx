import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space, touchTarget, type } from '@/design/theme';
import { LabeledTextField } from '../components/LabeledTextField';

/**
 * Static Log In screen (Milestone 1). There is no sign-in yet: Cognito arrives in Phase 2, so the
 * button and link do nothing and nothing typed here leaves the screen. Wording follows the Brand
 * Foundation ("Log In", "Forgot your password?") and decision 1 (sign in with an email address).
 */
export function LogInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>
            Log In
          </Text>

          <View style={styles.form}>
            <LabeledTextField
              label="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              inputMode="email"
              keyboardType="email-address"
              textContentType="username"
              returnKeyType="next"
              testID="login-email"
            />
            <LabeledTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              testID="login-password"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log In"
            onPress={() => undefined}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            testID="login-submit"
          >
            <Text style={styles.buttonLabel}>Log In</Text>
          </Pressable>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Forgot your password?"
            onPress={() => undefined}
            hitSlop={space.sm}
            style={styles.linkTarget}
            testID="login-forgot-password"
          >
            <Text style={styles.link}>Forgot your password?</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
  },
  title: {
    ...type.title,
    color: colors.textPrimary,
  },
  form: {
    gap: space.md,
  },
  button: {
    minHeight: touchTarget,
    borderRadius: radius.control,
    backgroundColor: colors.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  buttonPressed: {
    backgroundColor: colors.actionPrimaryPressed,
  },
  buttonLabel: {
    ...type.button,
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
  linkTarget: {
    alignSelf: 'center',
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  link: {
    ...type.body,
    color: colors.textLink,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
