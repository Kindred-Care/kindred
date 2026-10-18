# Criterion 3: visual comparison with the Figma frames

## The criterion

Section 10, criterion 3, as worded in the Phase 0 plan (the 2026-10-15 draft; the approved revision
`Kindred_Phase0_Final_Closed_rev355` is not stored in this repository, and the design brief quotes the
same words from it):

> "Splash and Log In match the Figma at 390pt width within an agreed tolerance, using tokens with no
> inline hex values."

It names no platform. The iOS simulator is required by criterion 2 and physical devices by criterion 15;
neither is part of criterion 3. The "agreed tolerance" is design brief 6b (approved 2026-10-17):
positions and dimensions within **±2 pt** at **390 pt and 402 pt**; brand colours exact; typography
family, size and weight exact; accessibility requirements hold; responsive behaviour, safe areas and
accessibility text scaling take precedence over pixel matching.

**Status: Partial.** Positions and dimensions are within ±2 pt at both widths, colours are exact and
there is no inline hex. Two typography properties cannot be verified from PNG exports, and the 390 pt
mapping needs acceptance (see the end of this page).

## References

| File in this folder | Source | Byte check |
| --- | --- | --- |
| [mobile-splash-1x.png](mobile-splash-1x.png) | Founder-supplied Mobile – Splash export, attached in the working session 2026-10-18 | SHA-256 `97a29d99…1dadf`, identical to the attachment |
| [mobile-log-in-1x.png](mobile-log-in-1x.png) | Founder-supplied Mobile – Log In export, attached in the working session 2026-10-18 | SHA-256 `6b291d9e…0d856c`, identical to the attachment |

Both are 402 × 874 RGBA PNGs carrying Figma's own `Software: Figma` stamp and the chunk layout of a
direct Figma export (one image-data chunk, sRGB, gamma, 72 dpi), and they were copied without change.
They are the founder-supplied originals; nothing else is needed for the comparison. The design brief's
P1 also lists 2× exports; the ±2 pt measurement does not need them (1× gives 1 px per pt).

Not used: `Downloads/kindred-splash-402.png.png` on the development machine (also a Figma export) is an
earlier Log In draft despite its name, with the original Terracotta button, no Username field and
"Inputs" placeholder text, all superseded by the approved corrections.

## Method

1. The build ran on the Android emulator ("Medium Phone API 37.0") as a development build at exactly 3 px
   per pt (`wm density 480`), at **402 × 874 pt** (`wm size 1206x2622`) and **390 × 844 pt**
   (`wm size 1170x2532`), at the default text size.
2. [method/measure.py](method/measure.py) and [method/edges.py](method/edges.py) find each element's ink box
   (text glyphs, field borders, button fill) in the frame and in the capture, both in points.
   [method/capture.sh](method/capture.sh) takes the captures; [method/compose.py](method/compose.py)
   draws the side-by-side images (frame | build | 50% overlay).
3. The frames are 402 pt wide only. At 390 pt each element is compared with the frame by its anchor:
   centred elements (wordmark, tagline, button, link) 6 pt to the left, the right-anchored fields 12 pt to
   the left, left-anchored labels unchanged. Vertical positions are measured from the top of the screen,
   as in the frames.
4. Measured glyph boxes (not text line boxes), so the comparison is independent of line-height settings.

The status bar, the home indicator and the round menu button at the top right in the captures belong to
the device and to the development build, not to Kindred.

## Results: Log In

All values in pt: left–right × top–bottom.

| Element | Figma, 402 | Build, 402 | Largest difference | Figma at 390 (by anchor) | Build, 390 | Largest difference |
| --- | --- | --- | --- | --- | --- | --- |
| Wordmark | 87–313 × 114–163 | 88.3–313.7 × 115–163 | 1.3 | 81–307 × 114–163 | 82.3–307.7 × 115–163 | 1.3 |
| Tagline | 69–332 × 181–205 | 69.0–331.7 × 181–204.3 | 0.7 | 63–326 × 181–205 | 63.0–325.7 × 181–204.3 | 0.7 |
| "Username:" | 32–150 × 345–363 | 32.0–151.7 × 345.3–363 | 1.7 | 32–150 × 345–363 | 32.0–151.7 × 345.3–363 | 1.7 |
| "Password:" | 32–145 × 405–423 | 32.0–146.0 × 404.3–422 | 1.0 | 32–145 × 405–423 | 32.0–146.0 × 404.3–422 | 1.0 |
| Username field | 172–371 × 330–382 | 172.0–371.0 × 330–382 | 0 | 160–359 × 330–382 | 162.0–359.0 × 330–382 | **2.0** |
| Password field | 172–371 × 389–441 | 172.0–371.0 × 389–441 | 0 | 160–359 × 389–441 | 162.0–359.0 × 389–441 | **2.0** |
| Log In button | 147–254 × 481–533 | 147.3–254.0 × 481–533 | 0.3 | 141–248 × 481–533 | 141.3–248.0 × 481–533 | 0.3 |
| Forgot your password? | 115–286 × 554–570 | 115.0–286.3 × 553.7–569.3 | 0.7 | 109–280 × 554–570 | 109.0–280.3 × 553.7–569.3 | 0.7 |

Side by side: [402 pt](c3-log-in-402-compare.png), [390 pt](c3-log-in-390-compare.png). Captures:
[402](c3-build-log-in-402.png), [390](c3-build-log-in-390.png).

## Results: Splash

| Element | Figma, 402 | Build, 402 | Largest difference | Figma at 390 (by anchor) | Build, 390 | Largest difference |
| --- | --- | --- | --- | --- | --- | --- |
| Wordmark | 88–314 × 321–370 | 88.3–313.7 × 322–370 | 1.0 | 82–308 × 321–370 | 82.3–307.7 × 322.3–370 | 1.3 |
| Tagline | 69–332 × 388–412 | 69.0–331.7 × 388–411.3 | 0.7 | 63–326 × 388–412 | 63.0–325.7 × 388–411.3 | 0.7 |

Side by side: [402 pt](c3-splash-402-compare.png), [390 pt](c3-splash-390-compare.png).

## Colours and typography

- Colours: Warm White `#FCFBF8` background, Charcoal `#2F2F2F` text, White field fill, `#767676` field
  border and `#A94F32` button fill read exactly in the frame and the capture. The 2 pt `#A94F32` focus
  outline appears when a field has focus
  ([keyboard focus at 390 pt](c4-build-log-in-390-keyboard-focus.png)).
- Typography: wordmark Inter Regular 64, tagline Inter Regular 24 and button Inter Medium 20 are approved
  and match. The link is Inter Regular 16 Charcoal (design brief default, consistent with the export) and
  not underlined, as the approved reference shows. Labels and wordmark letter spacing: see below.

## Genuine mismatches versus accessibility or responsive adaptations

| Difference | Kind | Notes |
| --- | --- | --- |
| At 390 pt the fields are 197 pt wide and start 2 pt right of the anchored position | **Responsive adaptation**, at the tolerance limit | The fields keep at least 8 pt between "Username:" and its field and give way rather than overlap the label; both fields keep a shared width and right edge |
| The link's touch target is 48 pt tall | **Accessibility** (48 pt targets) | Invisible; the link glyphs sit where the frame has them |
| Labels stack above their fields at large text or on narrow screens; the content scrolls | **Accessibility** (text scaling to 200%) | Default text size matches the frame; [200% at 390 pt](c4-build-log-in-390-font-200.png) |
| Content never starts above the safe area | **Safe areas** | On screens whose top inset is under 101 pt (all current phones) it has no effect |
| Wordmark glyphs 1 pt lower than the frame | Measurement noise | Within tolerance |
| No other differences found | — | — |

## Open before criterion 3 can be marked Passed

Typography must match "exactly as approved" (6b), and a PNG cannot prove a font property:

1. **Field labels** ("Username:", "Password:"). The design brief's default was Inter Medium 16, "unless
   the frame specifies otherwise". The export is consistent with **Inter Regular 24** (cap height 18 pt,
   glyph positions, stem width), which the build uses, but that is a measurement, not the Figma text
   property. Token `font.size.label` is flagged `placeholder`.
2. **Wordmark letter spacing.** Inter Regular 64 with no tracking draws "Kindred" 221 pt wide; the
   exports show 226 pt. The build uses **0.7 pt**, inferred from the image, to stay within ±2 pt. Token
   `letterSpacing.wordmark` is flagged `placeholder`. If Figma's value is 0, the wordmark is a genuine
   mismatch of about 2.5 pt per side and the cause must be found.

   To read both in Figma: open the file, select the **Mobile – Log In** frame, and in the Layers panel
   click the **Username:** text layer. The right sidebar's **Typography** (Text) section shows font,
   style (weight), size, line height and letter spacing; in Dev Mode (**Shift+D**) the **Inspect** panel
   shows the same under Typography. Repeat for **Password:** and for the **Kindred** wordmark layer in
   both frames.
3. **The 390 pt reference.** There is no 390 pt frame, so the 390 pt comparison maps the 402 pt frame by
   each element's anchor (centred, left or right edge; see Method). The tolerance requires comparison at
   390 pt but does not say how a 402 pt frame applies there, so this mapping needs the founder's
   acceptance, or a 390 pt export of the same frames.
