import { fontFamilyFor, type FontWeight } from './fonts';
import { tokens } from './tokens';

/**
 * Typed access to the generated design tokens. Components read colours, spacing and type from here
 * and never hard-code values (lint rule: no inline hex colours).
 */
export const colors = {
  background: tokens.color.surface.background,
  splash: tokens.color.surface.splash,
  input: tokens.color.surface.input,
  textPrimary: tokens.color.text.primary,
  textLink: tokens.color.text.link,
  textOnPrimary: tokens.color.text.onPrimary,
  textOnSplash: tokens.color.text.onSplash,
  actionPrimary: tokens.color.action.primary,
  actionPrimaryPressed: tokens.color.action.primaryPressed,
  borderInput: tokens.color.border.input,
  borderFocus: tokens.color.border.focus,
} as const;

export const space = tokens.space;
export const radius = tokens.radius;
export const size = tokens.size;
export const touchTarget = tokens.size.touchTarget;
export const letterSpacing = tokens.letterSpacing;
export const wordmarkMaxScale = tokens.scale.wordmarkMax;
export const splashDurationMs = tokens.motion.splash;

const { weight, size: fontSize, lineHeight } = tokens.font;

/**
 * Line height: 1.2x for 20 pt and larger, 1.5x for 16 pt and smaller (design brief defaults). Android's
 * extra font padding is off so a line box is the same height on both platforms, as in Figma.
 */
const textStyle = (sizePt: number, fontWeight: FontWeight) => ({
  fontFamily: fontFamilyFor(fontWeight),
  fontSize: sizePt,
  lineHeight: Math.round(sizePt * (sizePt >= 20 ? lineHeight.heading : lineHeight.body)),
  includeFontPadding: false,
});

export const type = {
  wordmark: textStyle(fontSize.wordmark, weight.regular),
  tagline: textStyle(fontSize.tagline, weight.regular),
  body: textStyle(fontSize.body, weight.regular),
  label: textStyle(fontSize.label, weight.regular),
  button: textStyle(fontSize.button, weight.medium),
  link: textStyle(fontSize.link, weight.regular),
} as const;
