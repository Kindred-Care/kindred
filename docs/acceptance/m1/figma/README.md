# Criterion 3: visual comparison with the Figma frames

Section 10 criterion 3: the splash and Log In screens match the Figma at 390 pt, within the agreed
tolerance, using tokens with no inline hex. Tolerance (design brief 6b, approved 2026-10-17): component
positions and dimensions within **±2 pt** at **390 pt and 402 pt**; brand colours exact; typography
family, size and weight exact; accessibility requirements hold. Responsive behaviour, safe areas and
accessibility text scaling take precedence over pixel matching.

**Status: Partial.** On the Android emulator every measured element is within ±2 pt at both widths
(details below). It is not yet Passed because of the open items at the end of this page.

## References

| File | What it is |
| --- | --- |
| [mobile-splash-1x.png](mobile-splash-1x.png) | Mobile – Splash frame, 402 × 874, founder-approved reference (2026-10-18) |
| [mobile-log-in-1x.png](mobile-log-in-1x.png) | Mobile – Log In frame, 402 × 874, founder-approved reference (2026-10-18) |

These were taken from the images the founder pasted into the working session. The founder will also
supply the original 1× exports (2× if needed). When they arrive, they replace these two files and the
measurements are repeated with the same scripts.

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
- Typography: wordmark Inter Regular 64, tagline Inter Regular 24, button Inter Medium 20 (approved);
  labels Inter Regular 24 and link Inter Regular 16, as read from the frame (see open items).

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

1. **Original exports.** Repeat the comparison against the original 1× exports when the founder provides
   them (the files here came through the working session).
2. **Values read from the frame that the founder has not stated.** Please confirm, ideally from Figma
   Dev Mode: field labels Inter **Regular 24**; the link Inter **Regular 16**, Charcoal, **not
   underlined**; wordmark letter spacing of about **0.7 pt** (without it, Inter 64 draws "Kindred" 5 pt
   narrower than the frame's 226 pt).
3. **iOS.** The same comparison on the iOS simulator at 390 and 402 pt (needs the Mac).
