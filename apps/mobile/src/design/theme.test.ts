import appConfig from '../../app.config';
import { fontAssets, interFaces } from './fonts';
import { colors, type } from './theme';
import { defaultTokens, placeholderTokens, tokens, tokensArePlaceholders } from './tokens';

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

  it('REQ-PLAT-018 no placeholders remain, and documented defaults are listed apart from approved values', () => {
    expect(tokensArePlaceholders).toBe(false);
    expect(placeholderTokens).toEqual([]);
    // Layout now comes from the Figma frame exports; behaviour the frame cannot show stays a default.
    expect(defaultTokens).not.toContain('space.brandToForm');
    expect(defaultTokens).not.toContain('size.fieldWidth');
    expect(defaultTokens).toContain('size.minFieldWidth');
    expect(defaultTokens).not.toContain('color.action.primary');
  });

  it('REQ-PLAT-017 the approved accessibility corrections are the ones in use', () => {
    // B1: buttons use the accessible variant; Terracotta itself stays the brand colour.
    expect(colors.actionPrimary).toBe(tokens.color.brand.terracottaButton);
    expect(colors.actionPrimary).not.toBe(tokens.color.brand.terracotta);
    // A focused field's border is the same #A94F32 (founder decision 2026-10-18).
    expect(colors.borderFocus).toBe(tokens.color.brand.terracottaButton);
    // B2: fields use the corrected border, not the original Figma border.
    expect(colors.borderInput).toBe(tokens.color.border.input);
    expect(colors.borderInput).not.toBe(tokens.color.brand.inputBorder);
    expect(colors.background).toBe(tokens.color.brand.warmWhite);
    expect(colors.textPrimary).toBe(tokens.color.brand.charcoal);
  });

  it('REQ-PLAT-017 every text style uses a bundled Inter face', () => {
    const bundled = new Set(Object.keys(fontAssets));
    for (const style of Object.values(type)) {
      expect(bundled).toContain(style.fontFamily);
      expect(style).not.toHaveProperty('fontWeight');
    }
    expect(Object.values(interFaces).sort()).toEqual([...bundled].sort());
  });

  it('REQ-MOB-001 the native launch screen matches the splash colour, so there is no colour flash', () => {
    const splashPlugin = appConfig.plugins?.find(
      (plugin): plugin is [string, { backgroundColor: string }] =>
        Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
    );
    expect(splashPlugin?.[1].backgroundColor).toBe(colors.splash);
  });
});
