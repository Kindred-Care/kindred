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
  textSecondary: tokens.color.text.secondary,
  textPlaceholder: tokens.color.text.placeholder,
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
export const touchTarget = tokens.size.touchTarget;

/** "System" means the platform font: React Native uses it when no family is set. */
const family = tokens.font.family.base === 'System' ? undefined : tokens.font.family.base;

type Weight = '400' | '600' | '700';
const weight = (value: number) => String(value) as Weight;

export const type = {
  wordmark: { fontFamily: family, fontSize: tokens.font.size.wordmark, fontWeight: weight(tokens.font.weight.bold) },
  title: { fontFamily: family, fontSize: tokens.font.size.title, fontWeight: weight(tokens.font.weight.bold) },
  body: { fontFamily: family, fontSize: tokens.font.size.body, fontWeight: weight(tokens.font.weight.regular) },
  label: { fontFamily: family, fontSize: tokens.font.size.label, fontWeight: weight(tokens.font.weight.semibold) },
  caption: { fontFamily: family, fontSize: tokens.font.size.caption, fontWeight: weight(tokens.font.weight.regular) },
  button: { fontFamily: family, fontSize: tokens.font.size.body, fontWeight: weight(tokens.font.weight.semibold) },
} as const;
