import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space, touchTarget, type } from '@/design/theme';
import { Brand } from '../components/Brand';
import { fieldWidthFor, LabeledTextField, shouldStackLabels } from '../components/LabeledTextField';

const LABELS = { username: 'Username:', password: 'Password:' } as const;

/**
 * Static Log In screen (Milestone 1), matching the founder-approved Mobile – Log In frame: the wordmark
 * and tagline, "Username:" and "Password:" beside their fields, the compact centred Log In button,
 * then "Forgot your password?" centred beneath it. There is no "Log In" heading.
 *
 * Content is placed from the top of the screen at the frame's positions, never above the safe area,
 * and scrolls when large text makes it taller than the screen.
 *
 * There is no sign-in yet (Cognito arrives in Phase 2): the button and link do nothing and nothing
 * typed here leaves the screen.
 */
export function LogInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formWidth, setFormWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState({ username: 0, password: 0 });
  const insets = useSafeAreaInsets();

  // Both rows switch together, so the fields keep a shared right edge or a shared top-to-bottom flow.
  const labelWidth = Math.ceil(Math.max(labelWidths.username, labelWidths.password));
  const stacked = shouldStackLabels(labelWidth, formWidth);
  const fieldWidth = fieldWidthFor(labelWidth, formWidth);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: Math.max(0, space.brandTopLogIn - insets.top) }]}
          keyboardShouldPersistTaps="handled"
        >
          <Brand />

          <View
            style={styles.form}
            onLayout={(event) => setFormWidth(event.nativeEvent.layout.width)}
            testID="login-form"
          >
            {/* Natural label widths at the current text size, measured off-screen to choose the layout. */}
            {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((key) => (
              <Text
                key={key}
                style={[styles.measure, type.label]}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setLabelWidths((current) => (current[key] === width ? current : { ...current, [key]: width }));
                }}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                testID={`login-measure-${key}`}
              >
                {LABELS[key]}
              </Text>
            ))}

            <LabeledTextField
              label={LABELS.username}
              accessibilityLabel="Username"
              stacked={stacked}
              fieldWidth={fieldWidth}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              textContentType="username"
              returnKeyType="next"
              testID="login-username"
            />
            <LabeledTextField
              label={LABELS.password}
              accessibilityLabel="Password"
              stacked={stacked}
              fieldWidth={fieldWidth}
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
    paddingLeft: space.screenMarginStart,
    paddingRight: space.screenMarginEnd,
    paddingBottom: space.screenBottom,
  },
  form: {
    marginTop: space.brandToForm,
    gap: space.row,
  },
  measure: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
  },
  // Hugs its label (24 + text + 24), centred, as in the frame.
  button: {
    alignSelf: 'center',
    marginTop: space.beforeButton,
    minHeight: touchTarget,
    borderRadius: radius.control,
    backgroundColor: colors.actionPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.controlGap,
    paddingHorizontal: space.controlPaddingX,
    paddingVertical: space.controlPaddingY,
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
    marginTop: space.beforeLink,
    alignSelf: 'center',
    minHeight: touchTarget,
    minWidth: touchTarget,
    justifyContent: 'center',
  },
  link: {
    ...type.link,
    color: colors.textLink,
    textAlign: 'center',
  },
});
