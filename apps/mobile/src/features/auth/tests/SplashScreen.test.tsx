import { act, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors } from '@/design/theme';
import { SPLASH_DURATION_MS, SplashScreen } from '../screens/SplashScreen';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('REQ-MOB-001 shows the brand, then goes to Log In', async () => {
    await render(<SplashScreen />);

    expect(screen.getByRole('header', { name: 'Kindred' })).toBeOnTheScreen();
    expect(screen.getByText('Care for Every Chapter.')).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(SPLASH_DURATION_MS));

    expect(mockReplace).toHaveBeenCalledWith('/log-in');
  });

  it('REQ-MOB-003 uses the Warm White background with Charcoal text and no artwork', async () => {
    const { toJSON } = await render(<SplashScreen />);

    const container = StyleSheet.flatten(screen.getByTestId('splash').props.style);
    expect(container.backgroundColor).toBe(colors.splash);
    expect(StyleSheet.flatten(screen.getByTestId('brand-wordmark').props.style).color).toBe(colors.textOnSplash);
    // The botanical leaves are deferred: no image is drawn on the splash.
    expect(JSON.stringify(toJSON())).not.toMatch(/"type":"Image"/);
  });

  it('REQ-MOB-001 does not navigate after it unmounts', async () => {
    const { unmount } = await render(<SplashScreen />);
    await unmount();

    await act(() => jest.advanceTimersByTime(SPLASH_DURATION_MS));

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
