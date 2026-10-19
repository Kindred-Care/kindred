// GENERATED FILE. Do not edit by hand.
// Source: design/tokens/tokens.json. Regenerate with `npm run codegen`.
// CI fails if this file differs from what the generator produces.

export const tokens = {
  "color": {
    "brand": {
      "terracotta": "#C96A4A",
      "terracottaButton": "#A94F32",
      "apricot": "#F4B183",
      "warmWhite": "#FCFBF8",
      "white": "#FFFFFF",
      "charcoal": "#2F2F2F",
      "sage": "#A8CFA0",
      "inputBorder": "#E5E7EB"
    },
    "surface": {
      "background": "#FCFBF8",
      "splash": "#FCFBF8",
      "input": "#FFFFFF"
    },
    "text": {
      "primary": "#2F2F2F",
      "onSplash": "#2F2F2F",
      "onPrimary": "#FFFFFF",
      "link": "#2F2F2F"
    },
    "action": {
      "primary": "#A94F32",
      "primaryPressed": "#98472D"
    },
    "border": {
      "input": "#767676",
      "focus": "#A94F32"
    }
  },
  "space": {
    "controlPaddingX": 24,
    "controlPaddingY": 14,
    "controlGap": 10,
    "screenMarginStart": 30,
    "screenMarginEnd": 31,
    "brandTopLogIn": 101,
    "brandTopSplash": 308,
    "brandGap": -2,
    "brandToForm": 125,
    "row": 7,
    "label": 8,
    "labelRaise": 4,
    "beforeButton": 40,
    "beforeLink": 3,
    "screenBottom": 32
  },
  "radius": {
    "control": 12
  },
  "size": {
    "touchTarget": 48,
    "border": 1,
    "fieldWidth": 199,
    "borderFocus": 2,
    "minFieldWidth": 160
  },
  "font": {
    "family": {
      "base": "Inter"
    },
    "size": {
      "display": 56,
      "h1": 40,
      "h2": 32,
      "h3": 24,
      "body": 16,
      "caption": 14,
      "wordmark": 64,
      "tagline": 24,
      "button": 20,
      "label": 24,
      "link": 16
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "heading": 1.2,
      "body": 1.5
    }
  },
  "scale": {
    "wordmarkMax": 1.5
  },
  "motion": {
    "splash": 1500
  }
} as const;

/** Tokens still awaiting approved values from Figma. Visual acceptance is Provisional while non-empty. */
export const placeholderTokens: readonly string[] = [];

export const tokensArePlaceholders = false;

/** Implementation defaults from the design brief: documented values, not founder-approved designs. */
export const defaultTokens: readonly string[] = [
  "color.action.primaryPressed",
  "font.lineHeight.body",
  "font.lineHeight.heading",
  "font.size.link",
  "motion.splash",
  "scale.wordmarkMax",
  "size.minFieldWidth",
  "space.label",
  "space.screenBottom"
];
