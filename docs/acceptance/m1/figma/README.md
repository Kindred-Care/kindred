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

**Status: Partial.**

| Portion | Status |
| --- | --- |
| Android, 402 pt | **Passed**: every element within ±2 pt (largest 1.7 pt); colours exact; typography as confirmed in Figma; no inline hex |
| Android, 390 pt | Within ±2 pt (largest 2.0 pt) using the anchor mapping in Method; **Passed once the founder accepts that mapping** |
| iOS | **Not run.** The criterion's wording names no platform, but the founder's plan completes cross-platform acceptance on the Mac (2026-10-19); criterion 3 as a whole stays open until then |

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
| Wordmark | 87–313 × 114–163 | 88.0–313.7 × 114.7–163.7 | 1.0 | 81–307 × 114–163 | 82.0–307.7 × 114.7–163.7 | 1.0 |
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
| Wordmark | 88–314 × 321–370 | 88.0–313.7 × 321.7–370.7 | 0.7 | 82–308 × 321–370 | 82.0–307.7 × 321.7–370.7 | 0.7 |
| Tagline | 69–332 × 388–412 | 69.0–331.7 × 388–411.3 | 0.7 | 63–326 × 388–412 | 63.0–325.7 × 388–411.3 | 0.7 |

Side by side: [402 pt](c3-splash-402-compare.png), [390 pt](c3-splash-390-compare.png).

## Colours and typography

- Colours: Warm White `#FCFBF8` background, Charcoal `#2F2F2F` text, White field fill, `#767676` field
  border and `#A94F32` button fill read exactly in the frame and the capture. The 2 pt `#A94F32` focus
  outline appears when a field has focus
  ([keyboard focus at 390 pt](c4-build-log-in-390-keyboard-focus.png)).
- Typography, confirmed by the founder from the Figma text properties (2026-10-18): the **Username:**
  label is Inter Regular 24, letter spacing 0%, `#2F2F2F`; the **Kindred** wordmark is Inter Regular 64,
  letter spacing 0%, `#2F2F2F`. The build uses exactly these, with no letter spacing. The tagline (Inter
  Regular 24) and button (Inter Medium 20) are approved values and match. The link is Inter Regular 16
  Charcoal and, as the approved reference shows, not underlined. The **Password:** label uses the same
  style as Username: and measures the same; its own Figma layer was not separately read.
- Android-specific correction: React Native's shrink-to-fit drew the 64 pt wordmark about 2% small on
  Android even when it fitted (221 pt wide instead of 226 pt). Shrink-to-fit now switches on only when
  the system text size is enlarged; at the default size the wordmark is drawn at full size and matches
  the frames. At 200% text it still caps at 1.5× and shrinks to fit
  ([200% at 402 pt](c4-build-log-in-402-font-200.png): labels stack, nothing clipped). The earlier
  0.7 pt letter-spacing estimate was removed.
- Console: a development-build start at 402 pt with 200% text logged no error lines and no JavaScript
  errors or warnings ([log](c2-android-logcat-after-figma-match.txt)).

## Genuine mismatches versus accessibility or responsive adaptations

| Difference | Kind | Notes |
| --- | --- | --- |
| At 390 pt the fields are 197 pt wide and start 2 pt right of the anchored position | **Responsive adaptation**, at the tolerance limit | The fields keep at least 8 pt between "Username:" and its field and give way rather than overlap the label; both fields keep a shared width and right edge |
| The link's touch target is 48 pt tall | **Accessibility** (48 pt targets) | Invisible; the link glyphs sit where the frame has them |
| Labels stack above their fields at large text or on narrow screens; the content scrolls | **Accessibility** (text scaling to 200%) | Default text size matches the frame; [200% at 402 pt](c4-build-log-in-402-font-200.png) |
| Content never starts above the safe area | **Safe areas** | On screens whose top inset is under 101 pt (all current phones) it has no effect |
| Wordmark glyphs 1 pt lower than the frame | Measurement noise | Within tolerance |
| No other differences found | — | — |

## Open before criterion 3 can be marked Passed

1. **Founder acceptance of the 390 pt mapping** (Android 390 pt portion). There is no 390 pt frame, so
   the 390 pt comparison maps the 402 pt frame by each element's anchor: centred elements 6 pt left,
   right-anchored fields 12 pt left, left-anchored labels unchanged, vertical positions unchanged. The
   approved tolerance requires comparison at 390 pt but does not say how a 402 pt frame applies there.
2. **iOS** (2026-10-19, on the Mac): the same captures and measurements on the iOS simulator at 390 and
   402 pt; see the handoff checklist in the pull request.

Resolved on 2026-10-18: the reference files are the founder-supplied originals; the label and wordmark
text properties were read from Figma by the founder; the link stays not underlined.
