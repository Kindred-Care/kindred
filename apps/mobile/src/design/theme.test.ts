import { placeholderTokens, tokens, tokensArePlaceholders } from './tokens';
import { colors } from './theme';

describe('design tokens', () => {
  it('REQ-PLAT-017 every theme colour comes from a generated token', () => {
    const tokenColors = new Set<string>();
    const collect = (node: unknown) => {
      if (typeof node === 'string') tokenColors.add(node);
      else if (node && typeof node === 'object') Object.values(node).forEach(collect);
    };
    collect(tokens.color);

    for (const value of Object.values(colors)) expect(tokenColors).toContain(value);
  });

  it('REQ-PLAT-018 placeholder tokens are flagged, never presented as final', () => {
    // Flip this expectation when approved Figma values replace every placeholder.
    expect(tokensArePlaceholders).toBe(true);
    expect(placeholderTokens).toContain('color.brand.terracotta');
  });
});
