# 0022. Design token pipeline and placeholder flagging

- Status: Accepted, verification pending (the first Figma export has not been made; every token is a
  placeholder)
- Date: 2026-10-17
- Source: Section 3 Refinement 4 (design token synchronization, "method chosen in Milestone 1"), Section
  10 criteria 3 and 4; decisions 43 and 113

## Decision

- `design/tokens/tokens.json` is the single source, in the W3C Design Tokens (DTCG) format: `$value`,
  `$type`, aliases like `{color.brand.cream}`, and a `$extensions.kindred.status` of `approved` or
  `placeholder` on each token. Anything not marked `approved`, or that aliases a placeholder, is a
  placeholder.
- **Export method:** the founder exports the approved Figma variables as DTCG JSON (Figma's variable
  export, or the free Tokens Studio plugin where the native export is unavailable on the plan) and the
  values are committed through a pull request. No Figma API token is stored anywhere. Mockup images are
  never exported into the repository.
- `scripts/codegen/tokens.mjs` resolves aliases and writes `apps/mobile/src/design/tokens.ts` (never
  hand-edited) with the values, the list of placeholder tokens and `tokensArePlaceholders`. The native
  splash colour in `app.config.ts` reads the same file.
- CI job `design-tokens` fails on drift and on any declared text/background pair below WCAG 2.2 AA
  (4.5:1 for text, 3:1 for non-text UI), and warns while any placeholder remains.
- ESLint forbids inline hex colours in app code.

## Current placeholder values

The Brand Foundation's colour names (terracotta, apricot, cream) are used, but no exact values were
available to Milestone 1, so all 38 tokens are placeholders chosen to pass AA: terracotta is darkened so
white button text reaches 6.2:1 (observation 1), and the splash uses dark text on apricot (10.5:1)
because white on apricot fails. The font family is the platform system font until the Brand Foundation
names one. None of these are final brand specifications.

## Consequences

Criterion 3 is reported **Provisional** until approved tokens and mockups replace the placeholders;
criterion 4's contrast requirement is met by the placeholders and they are flagged.
