import { act, render, screen } from '@testing-library/react-native';

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
    expect(mockReplace).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(SPLASH_DURATION_MS));

    expect(mockReplace).toHaveBeenCalledWith('/log-in');
  });

  it('REQ-MOB-001 does not navigate after it unmounts', async () => {
    const { unmount } = await render(<SplashScreen />);
    await unmount();

    await act(() => jest.advanceTimersByTime(SPLASH_DURATION_MS));

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
