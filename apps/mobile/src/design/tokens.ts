// GENERATED FILE. Do not edit by hand.
// Source: design/tokens/tokens.json. Regenerate with `npm run codegen`.
// CI fails if this file differs from what the generator produces.

export const tokens = {
  "color": {
    "brand": {
      "terracotta": "#9A4A2C",
      "terracottaDeep": "#7E3A21",
      "apricot": "#F6C7A1",
      "cream": "#FBF5EE",
      "cocoa": "#2B1D16",
      "cocoaSoft": "#5A463B",
      "stone": "#8A776B",
      "white": "#FFFFFF"
    },
    "surface": {
      "background": "#FBF5EE",
      "splash": "#F6C7A1",
      "input": "#FFFFFF"
    },
    "text": {
      "primary": "#2B1D16",
      "secondary": "#5A463B",
      "placeholder": "#6B5649",
      "link": "#7E3A21",
      "onPrimary": "#FFFFFF",
      "onSplash": "#2B1D16"
    },
    "action": {
      "primary": "#9A4A2C",
      "primaryPressed": "#7E3A21"
    },
    "border": {
      "input": "#8A776B",
      "focus": "#7E3A21"
    }
  },
  "space": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32,
    "xxl": 48
  },
  "radius": {
    "control": 12
  },
  "size": {
    "touchTarget": 48
  },
  "font": {
    "family": {
      "base": "System"
    },
    "size": {
      "body": 17,
      "label": 16,
      "caption": 15,
      "title": 28,
      "wordmark": 44
    },
    "weight": {
      "regular": 400,
      "semibold": 600,
      "bold": 700
    }
  }
} as const;

/** Tokens still awaiting approved values from Figma. Visual acceptance is Provisional while non-empty. */
export const placeholderTokens: readonly string[] = [
  "color.action.primary",
  "color.action.primaryPressed",
  "color.border.focus",
  "color.border.input",
  "color.brand.apricot",
  "color.brand.cocoa",
  "color.brand.cocoaSoft",
  "color.brand.cream",
  "color.brand.stone",
  "color.brand.terracotta",
  "color.brand.terracottaDeep",
  "color.brand.white",
  "color.surface.background",
  "color.surface.input",
  "color.surface.splash",
  "color.text.link",
  "color.text.onPrimary",
  "color.text.onSplash",
  "color.text.placeholder",
  "color.text.primary",
  "color.text.secondary",
  "font.family.base",
  "font.size.body",
  "font.size.caption",
  "font.size.label",
  "font.size.title",
  "font.size.wordmark",
  "font.weight.bold",
  "font.weight.regular",
  "font.weight.semibold",
  "radius.control",
  "size.touchTarget",
  "space.lg",
  "space.md",
  "space.sm",
  "space.xl",
  "space.xs",
  "space.xxl"
];

export const tokensArePlaceholders = true;
