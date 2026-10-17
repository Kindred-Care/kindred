# 0013. Expo Router, TypeScript and EAS development builds

- Status: Accepted (device verification blocked: see criterion 15)
- Date: 2026-10-17
- Source: Section 1 (EAS development builds approved), Section 3 Refinement 1; decisions 110 to 112

## Decision

- Expo SDK 58, Expo Router, TypeScript in strict mode, React Native 0.88.
- Routes in `apps/mobile/app/` are thin re-exports of screens in `src/features/<feature>/screens`. Route
  groups: `(auth)` public, `(workspace)` and `(requester)` from Phase 2 and 3.
- EAS development builds (`expo-dev-client`) from day one, because camera, video and editor work needs
  native modules that Expo Go cannot load. `eas.json` defines `development` (internal distribution, real
  devices) and `development-simulator` (iOS simulator).
- The app identifier is `com.kindredcare.mobile` for iOS and Android. This is a placeholder chosen in
  Milestone 1: **confirm it before the first store submission**, because it cannot change afterwards.
- Light appearance only until approved dark-mode tokens exist.
- No web target: `apps/web` is reserved, and `react-dom` is kept only because Expo Router's web
  dependencies require it.

## Consequences

- Criterion 15 needs an EAS account and Apple Developer membership in the founder's name and one
  physical device per platform. Until then it is reported Blocked, never Passed.
- The iOS simulator check (criterion 2) runs on a Mac with the `development-simulator` profile or
  `npx expo run:ios`.
