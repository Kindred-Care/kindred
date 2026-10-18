# Milestone 1: iOS session on the Mac (2026-10-19)

The Android work for Milestone 1 is done (see [README.md](README.md)). This is what remains on iOS, in
order. Record every result in [README.md](README.md) and [figma/README.md](figma/README.md) exactly as
observed.

## 0. Before starting

- [ ] Merge order on GitHub: PR 16 (focus outline), then PR 17 (Figma match), each only with all required
      checks green.
- [ ] Decide whether you accept the **390 pt anchor mapping** used for criterion 3 (see
      [figma/README.md](figma/README.md), "Open"). The same mapping is used for the iOS 390 pt comparison.

## 1. Set up (about 20 minutes on a prepared Mac)

- [ ] Xcode with an iOS simulator runtime; Node from `.nvmrc`; CocoaPods if Xcode asks.
- [ ] `git pull` on `main`, then in `apps/mobile`: `npm ci`, then `npx expo run:ios` (builds the
      development client and opens the simulator). In a second terminal: `npm start`.
- [ ] Note the Xcode, iOS runtime and simulator versions for the evidence.

## 2. Criterion 2: splash then Log In, no console errors (iOS simulator half)

- [ ] Cold start on the simulator: native launch screen (Warm White, no artwork), Kindred splash, then
      Log In.
- [ ] Save the console output (Metro plus the Xcode or `xcrun simctl spawn booted log stream` output for
      the app) and confirm no errors. Note anything from the development client separately, as on
      Android.

## 3. Criterion 3: visual match (iOS portion)

- [ ] Simulators: **iPhone 16 Pro (402 × 874 pt)** and a **390 × 844 pt** model (for example iPhone 16e),
      both at 3× scale. Default text size.
- [ ] Hide the development client's floating button if possible, then capture the splash and Log In on
      each: `xcrun simctl io booted screenshot splash-402.png` (and so on).
- [ ] Measure with the same scripts: `python3 docs/acceptance/m1/figma/method/measure.py <capture> 3`
      and `edges.py` for the fields and labels; `compose.py` for the side-by-side images.
      (`capture.sh` is Android-only.)
- [ ] Every element within ±2 pt of the frames ([mobile-splash-1x.png](figma/mobile-splash-1x.png),
      [mobile-log-in-1x.png](figma/mobile-log-in-1x.png)), at both widths. Check the wordmark especially:
      on iOS shrink-to-fit is also off at the default text size.
- [ ] Add the iOS rows to [figma/README.md](figma/README.md). Only then can criterion 3 be marked Passed.

## 4. Criterion 4: screen reader and Dynamic Type (iOS half)

- [ ] VoiceOver (or Xcode's Accessibility Inspector): "Kindred" heading; "Username" and "Password" text
      fields (the visible "Username:" and "Password:" are not read twice); "Log In" button; "Forgot your
      password?" link.
- [ ] Settings → Accessibility → Display & Text Size → Larger Text, at the largest size that reaches at
      least 200%: nothing clipped; labels stack above the fields; the screen scrolls; the wordmark caps
      at 1.5× and shrinks to fit.
- [ ] Focus a field: 2 pt `#A94F32` outline.

## 5. Criterion 15: physical devices (still blocked)

- [ ] Needs Apple Developer Program enrollment (paused) and the EAS project (`npx eas-cli login`, then
      `eas init`); the Android half needs a physical Android phone. Record as Blocked if these are not in
      place.

## 6. Close out

- [ ] Update the status table in [README.md](README.md) (criteria 2, 3, 4) and the traceability rows
      REQ-MOB-001 to REQ-MOB-003, through a pull request with all required checks green.
