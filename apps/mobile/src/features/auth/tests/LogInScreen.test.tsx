import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { LogInScreen } from '../screens/LogInScreen';

describe('LogInScreen', () => {
  it('REQ-MOB-002 every control has a screen reader label and role', async () => {
    await render(<LogInScreen />);

    expect(screen.getByRole('header', { name: 'Log In' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Email address')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Forgot your password?' })).toBeOnTheScreen();
  });

  it('REQ-MOB-002 labels sit above their fields as visible text, not beside them', async () => {
    await render(<LogInScreen />);

    expect(screen.getByText('Email address')).toBeOnTheScreen();
    expect(screen.getByText('Password')).toBeOnTheScreen();
    expect(screen.queryByText(/Username:/)).toBeNull();
  });

  it('REQ-MOB-002 no text opts out of dynamic type and nothing has a fixed height', async () => {
    const { toJSON } = await render(<LogInScreen />);
    const offenders: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      const { type, props, children } = node as { type: string; props: Record<string, unknown>; children: unknown };
      if (props.allowFontScaling === false) offenders.push(`${type} disables font scaling`);
      if (typeof props.maxFontSizeMultiplier === 'number' && props.maxFontSizeMultiplier < 2) {
        offenders.push(`${type} caps font scaling below 200%`);
      }
      const style = StyleSheet.flatten(props.style as never) as Record<string, unknown> | undefined;
      if (style && typeof style.height === 'number') offenders.push(`${type} has a fixed height`);
      walk(children);
    };
    walk(toJSON());

    expect(offenders).toEqual([]);
  });

  it('REQ-MOB-001 the password field is masked and typing stays on the screen', async () => {
    await render(<LogInScreen />);

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
    await fireEvent.changeText(screen.getByLabelText('Email address'), 'avery.testperson@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
    expect(screen.getByLabelText('Email address').props.value).toBe('avery.testperson@example.com');
  });
});
