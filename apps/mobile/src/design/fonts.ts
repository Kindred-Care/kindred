import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

import { tokens } from './tokens';

/**
 * Inter (SIL Open Font License 1.1) is bundled with the app in the four weights the design system uses.
 * Each weight is registered as its own family, because a custom font with `fontWeight` set falls back
 * to a synthesized or system face on Android. Styles therefore pick the family and never set a weight.
 */
export const interFaces = {
  [tokens.font.weight.regular]: 'Inter_400Regular',
  [tokens.font.weight.medium]: 'Inter_500Medium',
  [tokens.font.weight.semibold]: 'Inter_600SemiBold',
  [tokens.font.weight.bold]: 'Inter_700Bold',
} as const;

export type FontWeight = keyof typeof interFaces;

/** The font files to load at start-up, keyed by the family names in `interFaces`. */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

export function fontFamilyFor(weight: FontWeight): string {
  if (tokens.font.family.base !== 'Inter') {
    throw new Error(`No bundled faces for font family "${tokens.font.family.base}"`);
  }
  return interFaces[weight];
}
