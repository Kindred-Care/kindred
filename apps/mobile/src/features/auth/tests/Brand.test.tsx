import { render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { wordmarkMaxScale } from '@/design/theme';
import { Brand } from '../components/Brand';

const window = Dimensions.get('window');
const setFontScale = (fontScale: number) =>
  Dimensions.set({ window: { ...window, fontScale }, screen: { ...Dimensions.get('screen'), fontScale } });

describe('Brand', () => {
  afterEach(() => setFontScale(window.fontScale));

  it('REQ-MOB-003 the wordmark is drawn at full size at the default text size (no shrink-to-fit)', async () => {
    setFontScale(1);
    await render(<Brand />);

    expect(screen.getByTestId('brand-wordmark').props.adjustsFontSizeToFit).toBe(false);
  });

  it('REQ-MOB-002 with enlarged text the wordmark is capped at 1.5x and shrinks to fit its line', async () => {
    setFontScale(2);
    await render(<Brand />);

    const wordmark = screen.getByTestId('brand-wordmark');
    expect(wordmark.props.adjustsFontSizeToFit).toBe(true);
    expect(wordmark.props.maxFontSizeMultiplier).toBe(wordmarkMaxScale);
    expect(wordmark.props.numberOfLines).toBe(1);
  });
});
