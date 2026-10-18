# Milestone 1 design brief: splash and Log In

- Status: **Baseline approved by the founder (2026-10-17)**, reviewed directly in Figma. The
  accessibility corrections (B1, B2) and the visual-match tolerance (B3) were **approved by the founder on
  2026-10-17**. Two layout questions (Q1, Q2) stay **open until the founder confirms the actual Figma
  layout**.
- Scope: the visual baseline for Milestone 1 only (Section 10, criteria 2, 3 and 4).
- Implementation: **not started.** It begins only on the founder's explicit authorization.

This brief is the single reference for building the Milestone 1 splash and Log In screens. Values marked
**Approved** come from the founder's Figma review. Values marked **Default** were not specified; they are
implementation defaults chosen here and are not founder-approved designs. No further Figma exports are
requested, except for the two layout answers in the open questions.

## 1. Brand identity (Approved)

| Item | Value |
| --- | --- |
| App name | Kindred |
| Tagline | Care for Every Chapter. |
| Font family | Inter |

### Colours

| Token (proposed name) | Role | Hex |
| --- | --- | --- |
| `color.brand.terracotta` | Primary Terracotta | `#C96A4A` |
| `color.brand.apricot` | Secondary Apricot | `#F4B183` |
| `color.brand.warmWhite` | Background Warm White | `#FCFBF8` |
| `color.brand.white` | Surface White | `#FFFFFF` |
| `color.brand.charcoal` | Text Charcoal | `#2F2F2F` |
| `color.brand.sage` | Success Sage | `#A8CFA0` |
| `color.brand.inputBorder` | Input Border (original Figma value) | `#E5E7EB` (replaced for fields by `#767676`, section 6a) |
| `color.brand.terracottaButton` | Button-specific Terracotta (accessibility variant, approved 2026-10-17) | `#A94F32` |
| `color.border.input` | Field border (accessibility correction, approved 2026-10-17) | `#767676` |

Apricot and Sage are not used on the Milestone 1 screens. Use them as fills behind Charcoal text (7.31:1
and 7.71:1), never as text or as the only boundary of a control on a light background (both below 2:1).

### Typography (design system)

| Token (proposed) | Style | Size | Weight |
| --- | --- | --- | --- |
| `type.display` | Display | 56 px | Inter Bold (700) |
| `type.h1` | H1 | 40 px | Inter Bold (700) |
| `type.h2` | H2 | 32 px | Inter Bold (700) |
| `type.h3` | H3 | 24 px | Inter SemiBold (600) |
| `type.body` | Body | 16 px | Inter Regular (400) |
| `type.caption` | Caption | 14 px | Inter Regular (400) |

Figma pixels are treated as React Native points (1 px in a 402-wide frame equals 1 pt).

## 2. Splash screen

Reference frame 402 × 874.

| Element | Specification | Source |
| --- | --- | --- |
| Background | Warm White `#FCFBF8` | Approved |
| Wordmark | "Kindred", Inter Regular 64, Charcoal `#2F2F2F` | Approved |
| Tagline | "Care for Every Chapter.", Inter Regular 24, Charcoal | Approved |
| Arrangement | Centred branding, as in the existing Figma | Approved |
| Decorative apricot botanical leaves | **Deferred.** Not in Milestone 1; no leaf logo or decorative artwork may be invented | Approved (deferral) |
| Native launch screen (before JavaScript loads) | Warm White, no artwork, so it hands over to the splash without a colour flash | Default |
| Gap between wordmark and tagline | 8 pt | Default |
| Duration | 1.5 s, then Log In (current implementation) | Default |
| Large text | Text scales with the system setting. The wordmark is capped at 1.5× and shrinks to fit its line; the tagline wraps and is never truncated | Default |

The earlier apricot background with white text is superseded (it was 1.83:1 and failed contrast).

## 3. Log In screen

Reference frame 402 × 874, background Warm White `#FCFBF8`. Preserve the existing Figma layout and its
labels: **Username**, **Password**, **Forgot your password?** and **Log In**.

### Log In button (Approved)

| Property | Value |
| --- | --- |
| Fill | Terracotta `#C96A4A` |
| Label | "Log In", White `#FFFFFF`, Inter Medium (500) 20 |
| Corner radius | 12 |
| Padding | 24 horizontal, 14 vertical |
| Auto-layout gap | 10 |

Resulting height: 14 + 24 (line height of 20 pt text, default 1.2×) + 14 = 52 pt, above the 48 pt
touch target. **See blocker B1: the label fails contrast as specified; the approved correction is in section 6a.**

### Input fields (Approved)

| Property | Value |
| --- | --- |
| Fill | White `#FFFFFF` |
| Border | `#E5E7EB`, 1 px, inside stroke |
| Corner radius | 12 |
| Padding | 24 horizontal, 14 vertical |
| Auto-layout gap | 10 |

**See blocker B2: the field boundary fails non-text contrast as specified; the approved correction is in section 6a.**

### Details not specified in Figma (Defaults)

| Item | Default | Why |
| --- | --- | --- |
| Field labels | Inter Medium 16, Charcoal (12.94:1 on Warm White) | Readable, distinct from typed text |
| Typed text | Inter Regular 16 (Body), Charcoal (13.39:1 on White); field height 14 + 24 + 14 ≈ 52 pt (at least 48 pt) | Body style |
| Placeholder text inside fields | None; the visible label identifies the field | Avoids low-contrast hint text |
| Password field | Masked; no show-password control in Milestone 1 | Static shell |
| "Forgot your password?" | Inter Regular 16, Charcoal, underlined, 48 pt touch target | Terracotta text would be 3.60:1 and fail |
| Focus indicator on fields | **Approved:** border thickens from 1 pt to 2 pt and turns Terracotta (3.60:1 on Warm White). The change in thickness, not the colour alone, makes focus visible against the grey resting border (section 6a) | Founder approval 2026-10-17; WCAG 2.4.7 and 1.4.11 |
| Pressed button | Fill darkened about 10% | Feedback |
| Side margins | 24 pt each side, so content is 354 pt wide in a 402 frame | Matches the 24 pt padding rhythm |
| Vertical spacing | 16 pt between fields; 24 pt before the button; 16 pt before the link; label-to-field spacing follows the Figma layout once Q1 is confirmed | 8 pt grid; no label placement assumed (Q1 open) |
| Vertical placement | Content centred in the safe area and scrollable when it does not fit | Large text and small phones |
| Line heights | 1.2× for 20 pt and larger; 1.5× for 16 pt and smaller | Common readable defaults |

## 4. Implementation rules (from the founder's handoff)

- Milestone 1 visual baseline only. No real authentication, no Cognito, no biometric unlock, no caregiver
  or later-phase features. Log In stays a nonfunctional visual shell; nothing typed leaves the screen.
- Expo, React Native and TypeScript, as approved.
- Every colour, size and type style comes from design tokens. Inline hex values fail lint (existing rule).
- Responsive layout: respect iOS and Android safe areas; the 402 × 874 frame is a reference, not a fixed
  device size. Widths follow the screen; margins and spacing follow the tokens.
- Accessibility: contrast, screen-reader labels and roles, 48 pt touch targets, text scaling to 200%
  without clipping.
- Inter is bundled with the app (SIL Open Font License 1.1) in the four weights used (400, 500, 600, 700).
- Where Figma gives no value, use the documented defaults in this brief, never a value presented as
  founder-approved.
- Biometric sign-in is **not** shown on the Milestone 1 Log In screen. A returning-user screen may offer a
  biometric option in later design work (ADR 0028); that screen is outside Milestone 1.

## 5. Mapping to the Milestone 1 acceptance criteria

| Criterion | What this brief affects | Effect on status |
| --- | --- | --- |
| 2. Splash, then Log In, no console errors (iOS simulator and Android emulator) | Splash colours and tagline; native launch screen colour | Android must be re-run after implementation; iOS stays **Blocked** until the Mac is available |
| 3. Splash and Log In match the Figma at 390 pt, using tokens, no inline hex | Replaces the placeholder tokens with approved values; the approved tolerance (section 6b) | Stays **Provisional** until Q1 and Q2 are answered, the screens are built, and captures at 390 and 402 pt meet the approved tolerance |
| 4. Screen reader labels, 200% dynamic type, required contrast | Button and field contrast (resolved by the approved corrections); label placement (Q1) | The approved values now pass every contrast check; label placement depends on Q1 |
| 5. CI passes | Token contrast pairs are enforced by CI | The approved values pass the `design-tokens` contrast check |
| 6, 7, 1, 8 to 15 | Not affected | No change |

## 6. Blockers and open questions

B1, B2 and B3 are resolved by founder decisions. Q1 and Q2 stay open until the founder confirms the
actual Figma layout; nothing about them is assumed.

| # | Issue | Evidence | Options | Recommendation |
| --- | --- | --- | --- | --- |
| **B1** (resolved: correction approved, 6a) | White "Log In" label on Terracotta fails WCAG 2.2 AA | 3.72:1. Inter Medium 20 is not "large text" (that needs 24 pt, or about 18.7 pt Bold), so 4.5:1 is required | (a) Make the label Inter **Bold** 20: it then counts as large text and needs 3:1, which 3.72:1 passes; (b) a darker Terracotta for the button, e.g. `#B25A3C` (4.75:1) or `#AD573A` (5.00:1); (c) both | (a): a one-attribute change that keeps the brand colour |
| **B2** (resolved: correction approved, 6a) | Field boundary fails WCAG 1.4.11 (non-text contrast) | Border `#E5E7EB` is 1.20:1 on Warm White and 1.24:1 on White; the white field against Warm White is 1.03:1 | (a) A darker border, e.g. `#8A8F98` (3.14:1) or `#767B85` (4.11:1); (b) keep the light border and add another visible boundary, e.g. a tinted field fill, that reaches 3:1 | (a) `#8A8F98`, the lightest value that passes |
| **B3** (resolved: tolerance approved, 6b) | Criterion 3 says "at 390 pt width within an agreed tolerance", but the Figma frame is 402 pt, and no tolerance had been agreed | Section 10 criterion 3 | — | Approved 2026-10-17: ±2 pt at both 390 and 402 pt (section 6b) |
| **Q1** (open) | Label placement: are "Username" and "Password" **above** their fields in the current Figma, or beside them? | Section 1 observation 2 (labels beside fields break at large text) is still open in the blueprint | Awaiting the founder's confirmation of the Figma layout. No placement is assumed. If the labels are beside the fields, the founder decides how they behave at large text sizes, because criterion 4 requires no clipping at 200% | Open |
| **Q2** (open) | Does the Log In screen show a heading, the wordmark or the tagline above the fields? | Not in the handoff | Awaiting the founder's confirmation of the Figma layout. No branding element is added that is not in the mockup. The current build's "Log In" heading is not part of the approved baseline and is kept or removed to match Figma | Open |
| **Note** | "Username" label versus email sign-in | Appendix G decision 1: sign in with an email address, stored as the Cognito username | Keep "Username" for Milestone 1 as approved; revisit the wording when Cognito sign-in is built in Phase 2 | Not blocking Milestone 1 |

## 6a. Accessibility corrections (approved by the founder, 2026-10-17)

The founder asked to keep the approved design as close as possible, and proposed these two values on
2026-10-17. They were measured with the repository's WCAG code (`scripts/codegen/tokens-lib.mjs`). Both
pass. **The founder approved both on 2026-10-17**, together with showing field focus by thickening the
border to 2 pt. They are part of the approved baseline. Nothing is implemented until the founder
authorizes implementation.

### B1: button-specific darker Terracotta

| Pair | Measured | Required | Result |
| --- | --- | --- | --- |
| White `#FFFFFF` label on `#A94F32` | **5.45:1** | 4.5:1 (normal text: 20 pt Medium) | Pass |
| `#A94F32` button against the Warm White `#FCFBF8` page | 5.27:1 | 3:1 (non-text) | Pass |

- **Brand Terracotta `#C96A4A` stays the primary brand colour.** `#A94F32` is an accessibility variant
  used only as the fill of primary buttons that carry white text.
- Approved tokens: `color.brand.terracotta` stays `#C96A4A`, Kindred's primary brand colour;
  `color.brand.terracottaButton` `#A94F32` is the accessible button variant, not a replacement for the
  brand colour; `color.action.primary` points to `color.brand.terracottaButton`.
- The two shades differ by 1.47:1. Where both appear together they read as one family; it is a visual
  consistency point, not an accessibility one.

### B2: darker field border

| Pair | Measured | Required | Result |
| --- | --- | --- | --- |
| Border `#767676` against the White `#FFFFFF` field | **4.54:1** | 3:1 (non-text, WCAG 1.4.11) | Pass |
| Border `#767676` against the Warm White `#FCFBF8` page | **4.39:1** | 3:1 | Pass |

- Approved token: `color.border.input` `#767676` for all input field borders. The approved Figma value `#E5E7EB` stays recorded as
  the original design value.

### Other accessibility effects checked

| Concern | Finding | Proposed handling |
| --- | --- | --- |
| **Focus indicator on fields** | Against a `#767676` resting border, a Terracotta focus border differs by only 1.22:1 (`#C96A4A`) or 1.20:1 (`#A94F32`), so a colour change alone would hardly show focus | Show focus by **thickening the border from 1 pt to 2 pt** and turning it Terracotta. The thickness change satisfies WCAG 2.4.7 (Focus Visible) at AA. The stricter AAA focus-appearance criterion is not required for V1 |
| Pressed button state | Darkening `#A94F32` further only raises the white text contrast | No concern |
| Disabled button | Not used in Milestone 1 (the button is always enabled) | When added later, it must stay distinguishable without relying on colour alone |
| Colour-vision differences | The button and border rely on lightness contrast, not hue, so they hold for common colour-vision deficiencies | No concern |
| Future error states | A red error border next to a grey border would rely on colour alone | Out of Milestone 1 scope; add an icon or text message with any error border in later phases |
| Text contrast elsewhere | Unchanged: Charcoal on Warm White 12.94:1; Charcoal typed text on White 13.39:1 | No concern |

No other accessibility concern was found for these two screens.

## 6b. Visual-match tolerance (approved by the founder, 2026-10-17)

For criterion 3, side-by-side captures are compared with the Figma frames at **both 390 pt and 402 pt**
reference widths.

| Aspect | Rule |
| --- | --- |
| Component positions and dimensions | Within **±2 pt** of the Figma at the same reference width |
| Brand colours | Exactly as approved (including the approved accessibility corrections); no tolerance |
| Typography | Family, size and weight exactly as approved; no tolerance |
| Accessibility | Every approved requirement holds (contrast, labels and roles, touch targets, text scaling) |
| Precedence | **Responsive behaviour, safe areas and accessibility text scaling take precedence over rigid pixel matching.** Captures are taken at the default text size; differences caused by safe areas or larger text settings are expected and are not failures |

## 7. What remains to be implemented (after authorization)

1. Replace the placeholder tokens in `design/tokens/tokens.json` with the approved values (marked
   `approved`), add the approved corrections from section 6a (`#A94F32` button fill, `#767676` field
   border, 2 pt focus border), add the Defaults with a distinct status so they are not
   mistaken for approved values, and update the contrast pairs to the real foreground and background
   pairs.
2. Bundle Inter (400, 500, 600, 700) and apply the type tokens.
3. Splash: Warm White background, wordmark and tagline, native launch screen to Warm White.
4. Log In: the approved button and field styles and corrections, the "Username", "Password", "Forgot
   your password?" and "Log In" labels, the layout exactly as confirmed for Q1 and Q2, safe areas and
   scrolling.
5. Update the Jest tests (labels, roles, no font-scaling opt-out, no fixed heights) for the new labels.
6. Re-run the Android emulator evidence (criteria 2 and 4) and add side-by-side captures against the
   Figma at 390 and 402 pt for criterion 3, judged by the approved tolerance (section 6b).

Nothing in this list starts until the founder authorizes implementation.
