# 0022. Design token pipeline and placeholder flagging

- Status: Accepted. Approved values applied 2026-10-17 from the founder-approved design brief; no
  placeholders remain. Criterion 3's measurement waits for the Figma frame exports (P1).
- Date: 2026-10-17
- Source: Section 3 Refinement 4 (design token synchronization, "method chosen in Milestone 1"), Section
  10 criteria 3 and 4; decisions 43 and 113

## Decision

- `design/tokens/tokens.json` is the single source, in the W3C Design Tokens (DTCG) format: `$value`,
  `$type`, aliases like `{color.brand.warmWhite}`, and a `$extensions.kindred.status` on each token:
  `approved` (a founder-approved value), `default` (an implementation default documented in
  [the design brief](../../design/m1-figma-brief.md), never presented as a founder-approved design) or
  `placeholder`. A token's status is the weakest of its own and everything it aliases; a missing or
  unrecognized status counts as `placeholder`.
- **Export method:** the founder exports the approved Figma variables as DTCG JSON (Figma's variable
  export, or the free Tokens Studio plugin where the native export is unavailable on the plan) and the
  values are committed through a pull request. No Figma API token is stored anywhere. Mockup images are
  never exported into the repository.
- `scripts/codegen/tokens.mjs` resolves aliases and writes `apps/mobile/src/design/tokens.ts` (never
  hand-edited) with the values, the lists of placeholder and default tokens, and `tokensArePlaceholders`. The native
  splash colour in `app.config.ts` reads the same file.
- CI job `design-tokens` fails on drift and on any declared text/background pair below WCAG 2.2 AA
  (4.5:1 for text, 3:1 for non-text UI), and warns while any placeholder remains. Defaults are counted
  in its output but do not warn.
- ESLint forbids inline hex colours in app code.

## Current values (2026-10-17)

The approved brand colours, the approved accessibility corrections (B1 `#A94F32` button fill, B2
`#767676` field border, 2 pt focus border in `#A94F32` as set by the founder on 2026-10-18), the Inter type scale and the approved control specification
are `approved`. Values the handoff does not give (side margins, the gaps between rows, the gap from the
tagline to the form, the pressed fill, the link colour, line heights, the label-stacking width, the
wordmark's 1.5x cap and the splash duration) are `default`, as listed in the design brief. Every declared
pair passes AA. Inter (SIL Open Font License 1.1) is bundled in weights 400, 500, 600 and 700 through
`@expo-google-fonts/inter`; each weight is its own family, so styles never set `fontWeight`.

*Superseded:* before the approved brief, all 38 tokens were placeholders (darkened terracotta, an
apricot splash with dark text, the system font).

## Consequences

Criterion 3 stays **Provisional** until captures at 390 pt and 402 pt are compared with the Figma frame
exports (P1) within the approved ±2 pt tolerance. The `default` spacing tokens are then replaced with the
values read from the frames. Criterion 4's contrast requirement is met by approved values.
