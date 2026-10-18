import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors, size, space, touchTarget, wordmarkMaxScale } from '@/design/theme';
import { FIELD_MIN_HEIGHT, shouldStackLabels } from '../components/LabeledTextField';
import { LogInScreen } from '../screens/LogInScreen';

const style = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as never) as unknown as Record<string, unknown>;

// The visible labels and the measuring copies are hidden from screen readers, so queries must opt in.
const hidden = { includeHiddenElements: true } as const;

const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 24 } } });

/** Lays the form out at a content width and gives both labels a measured width. */
async function measure(formWidth: number, labelWidth: number) {
  await fireEvent(screen.getByTestId('login-form'), 'layout', layout(formWidth));
  await fireEvent(screen.getByTestId('login-measure-username', hidden), 'layout', layout(labelWidth));
  await fireEvent(screen.getByTestId('login-measure-password', hidden), 'layout', layout(labelWidth - 2));
}

// 390 pt screen minus the 24 pt margins on each side.
const CONTENT_390 = 390 - 2 * space.screenMargin;

describe('LogInScreen', () => {
  it('REQ-MOB-002 every control has a screen reader label and role', async () => {
    await render(<LogInScreen />);

    expect(screen.getByRole('header', { name: 'Kindred' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Username')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toBeOnTheScreen();
  });

  it('REQ-MOB-002 shows the confirmed content: wordmark, tagline, "Username:" and "Password:", and no Log In heading', async () => {
    await render(<LogInScreen />);

    expect(screen.getByTestId('brand-wordmark')).toHaveTextContent('Kindred');
    expect(screen.getByTestId('brand-tagline')).toHaveTextContent('Care for Every Chapter.');
    // The visible labels are on screen; screen readers get the field names instead (first test).
    expect(screen.getAllByText('Username:', hidden).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Password:', hidden).length).toBeGreaterThan(0);
    expect(screen.queryByText('Username:')).toBeNull();
    expect(screen.queryByRole('header', { name: 'Log In' })).toBeNull();
    // "Log In" appears only on the button.
    expect(screen.getAllByText('Log In')).toHaveLength(1);
    expect(screen.queryByPlaceholderText(/.+/)).toBeNull();
  });

  it('REQ-MOB-002 labels sit beside their fields at the default text size on a 390 pt screen', async () => {
    await render(<LogInScreen />);
    await measure(CONTENT_390, 80);

    for (const id of ['login-username-row', 'login-password-row']) {
      expect(style(screen.getByTestId(id)).flexDirection).toBe('row');
    }
  });

  it('REQ-MOB-002 labels stack above their fields when enlarged text no longer fits beside them', async () => {
    await render(<LogInScreen />);
    // About 2.2x the default label width: label + gap + 160 pt field is wider than 342 pt.
    await measure(CONTENT_390, 180);

    for (const id of ['login-username-row', 'login-password-row']) {
      expect(style(screen.getByTestId(id)).flexDirection).toBe('column');
    }
    expect(screen.getByLabelText('Username')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
  });

  it('REQ-MOB-002 labels stack on a narrow screen and return beside the fields when there is room', async () => {
    await render(<LogInScreen />);
    await measure(200, 80);
    expect(style(screen.getByTestId('login-username-row')).flexDirection).toBe('column');

    await measure(CONTENT_390, 80);
    expect(style(screen.getByTestId('login-username-row')).flexDirection).toBe('row');
  });

  it('REQ-MOB-002 the stacking rule follows the design brief default', () => {
    const room = CONTENT_390 - space.label - size.minFieldWidth;
    expect(shouldStackLabels(room, CONTENT_390)).toBe(false);
    expect(shouldStackLabels(room + 1, CONTENT_390)).toBe(true);
    // Nothing measured yet: keep the reference layout.
    expect(shouldStackLabels(0, CONTENT_390)).toBe(false);
    expect(shouldStackLabels(80, 0)).toBe(false);
  });

  it('REQ-MOB-002 no text opts out of dynamic type and nothing has a fixed height', async () => {
    const { toJSON } = await render(<LogInScreen />);
    const offenders: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      const { type, props, children } = node as { type: string; props: Record<string, unknown>; children: unknown };
      if (props.allowFontScaling === false) offenders.push(`${type} disables font scaling`);
      // The wordmark alone is capped at 1.5x and shrinks to fit its line (design brief, section 2).
      const cap = props.testID === 'brand-wordmark' ? wordmarkMaxScale : 2;
      if (typeof props.maxFontSizeMultiplier === 'number' && props.maxFontSizeMultiplier < cap) {
        offenders.push(`${type} caps font scaling below ${cap * 100}%`);
      }
      if (typeof props.numberOfLines === 'number' && props.testID !== 'brand-wordmark') {
        offenders.push(`${type} limits its lines and could truncate`);
      }
      const flat = StyleSheet.flatten(props.style as never) as Record<string, unknown> | undefined;
      if (flat && typeof flat.height === 'number') offenders.push(`${type} has a fixed height`);
      walk(children);
    };
    walk(toJSON());

    expect(offenders).toEqual([]);
    expect(screen.getByTestId('brand-wordmark').props.adjustsFontSizeToFit).toBe(true);
  });

  it('REQ-MOB-002 every control is at least a 48 pt touch target', async () => {
    await render(<LogInScreen />);

    for (const control of [
      screen.getByLabelText('Username'),
      screen.getByLabelText('Password'),
      screen.getByTestId('login-submit'),
      screen.getByTestId('login-forgot-password'),
    ]) {
      expect(style(control).minHeight).toBeGreaterThanOrEqual(touchTarget);
    }
  });

  it('REQ-MOB-003 fields are 52 pt tall at the default size, like the button (14 + 24 + 14)', async () => {
    await render(<LogInScreen />);

    expect(FIELD_MIN_HEIGHT).toBe(52);
    expect(style(screen.getByLabelText('Username')).minHeight).toBe(FIELD_MIN_HEIGHT);
    expect(style(screen.getByLabelText('Password')).minHeight).toBe(FIELD_MIN_HEIGHT);
  });

  it('REQ-MOB-003 controls use the approved colours, including the B1 and B2 corrections', async () => {
    await render(<LogInScreen />);

    expect(style(screen.getByTestId('login-submit')).backgroundColor).toBe(colors.actionPrimary);
    const field = style(screen.getByLabelText('Username'));
    expect(field.borderColor).toBe(colors.borderInput);
    expect(field.borderWidth).toBe(size.border);
    expect(field.backgroundColor).toBe(colors.input);
  });

  it('REQ-MOB-002 a focused field shows a 2 pt Terracotta border without changing its height', async () => {
    await render(<LogInScreen />);
    const resting = style(screen.getByLabelText('Username'));

    await fireEvent(screen.getByLabelText('Username'), 'focus');
    const focused = style(screen.getByLabelText('Username'));

    expect(focused.borderWidth).toBe(size.borderFocus);
    expect(focused.borderColor).toBe(colors.borderFocus);
    expect(Number(focused.borderWidth) + Number(focused.paddingVertical)).toBe(
      Number(resting.borderWidth) + Number(resting.paddingVertical),
    );

    await fireEvent(screen.getByLabelText('Username'), 'blur');
    expect(style(screen.getByLabelText('Username')).borderWidth).toBe(size.border);
  });

  it('REQ-MOB-001 the password field is masked and typing stays on the screen', async () => {
    await render(<LogInScreen />);

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
    await fireEvent.changeText(screen.getByLabelText('Username'), 'avery.testperson');
    await fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
    expect(screen.getByLabelText('Username').props.value).toBe('avery.testperson');
  });
});
