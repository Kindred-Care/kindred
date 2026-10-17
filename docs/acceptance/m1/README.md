# Milestone 1 acceptance evidence

Evidence for the Section 10 acceptance criteria, collected as each check runs. Only synthetic data appears
here. Results are reported exactly as observed: a check that could not run is listed as Blocked or Not
yet run, never as Passed.

## Android emulator run (criteria 2 and 4, Android half) — 2026-10-17

### Environment

| Item | Value |
| --- | --- |
| Host | Windows 11 Pro 10.0.26200, `LongPathsEnabled = 1` |
| Emulator | Android Studio "Medium Phone API 37.0" (`sdk_gphone64_x86_64`, `emulator-5554`), 1080 × 2400 |
| Build | Expo development build (`expo-dev-client`), `npx expo run:android`, debug, x86_64 |
| JDK | Android Studio bundled OpenJDK 25.0.3 |
| Gradle / CMake | Gradle 9.4.1; CMake **4.1.2** with ninja 1.12.1, selected with `cmake.dir` in `android/local.properties` |
| JavaScript | Metro, 1,279 modules bundled, connected through `adb reverse tcp:8081` |
| Source | Branch `feat/m1-backend-scaffold` at commit `22a644a` |

**CMake compatibility.** CMake 4 dropped support for projects that declare `cmake_minimum_required`
below 3.5. Every native module in the app declares 3.9 or higher (96 at 3.13, 3 at 3.16, 1 at 3.22,
1 at 3.13...3.26, 2 at 3.9.0), and none pins a CMake version, so the Android Gradle Plugin uses whatever
`cmake.dir` names. The build log and native build tree reference `cmake/4.1.2` 782 times and 3.22.1 not
at all. CMake 3.22.1 remains installed but was not used: its ninja 1.10.2 cannot handle Windows long
paths, which is what failed the earlier builds.

### Splash, then Log In (criterion 2, Android emulator)

A cold start was screen-recorded ([c2-android-run.mp4](c2-android-run.mp4)) while 30 screenshots were
taken back to back. Sampled centre colours show the sequence:

| Frames | Screen | Colour |
| --- | --- | --- |
| 1 to 7 | Native launch splash ([c2-android-0-native-splash.png](c2-android-0-native-splash.png)) | `#F6C7A1` (token `color.brand.apricot`) |
| 8 to 24 | Development client loading screen (development builds only; not Kindred UI) | `#FAFAFA` |
| 25 to 28 | Kindred splash with the wordmark ([c2-android-1-splash.png](c2-android-1-splash.png)) | `#F6C7A1` |
| 29 to 30 | Log In ([c2-android-2-login.png](c2-android-2-login.png)) | `#FBF5EE` (token `color.brand.cream`) |

The blue "Tools" button in the screenshots is the development client's menu. It exists only in
development builds.

**Console errors.** [c2-android-app-logcat.txt](c2-android-app-logcat.txt) is every log line from the
app process during the run (206 lines). It contains **0 error or fatal lines**, and the only
`ReactNativeJS` line is the informational `Running "main"`: no JavaScript errors or warnings. Metro
reported no errors. There are 81 native warning lines, all from the platform, React Native, Expo or the
emulator rather than Kindred code:

| Count | Tag | What it is |
| --- | --- | --- |
| 46 | `ViewManagerPropertyUpdater` | React Native's development-time lookup for generated view setters |
| 17 | `BridgelessReact` | React Native's new-architecture lifecycle trace, logged at warning level |
| 4 | `WindowOnBackDispatcher` | Android notice that the predictive back gesture is off (`predictiveBackGestureEnabled: false`) |
| 4 | `SoLoader` | Native library loader start-up trace |
| 3 | runtime (`dredcare.mobile`) | Emulator CPU variant notice and an Expo module class-verification timing |
| 3 | `HWUI` | Emulator graphics configuration fallbacks |
| 2 | `libc` | Emulator GPU property lookup (`vendor.mesa.virtgpu.kumquat`) |
| 1 | `ReactNative` | Packager connection already open |
| 1 | `BridgelessReactContext` | A dependency touched a legacy API in new-architecture mode; to watch, not an error |

The log contains no email address, password or token.

**Result (Android emulator half): passed.** The iOS simulator half is **Blocked**: it needs macOS. The
founder has a Mac for this later.

### Screen reader labels and 200% text (criterion 4, Android emulator)

The accessibility tree TalkBack reads was dumped at 100% and at Android's maximum 200% font size
([c4-android-a11y-tree-100.xml](c4-android-a11y-tree-100.xml),
[c4-android-a11y-tree-200.xml](c4-android-a11y-tree-200.xml)).

| Element | Announced as | Height at 100% / 200% |
| --- | --- | --- |
| Heading | "Log In" | 100 / 131 px |
| Email field | "Email address" (visible label above it) | 126 / 151 px (48 dp minimum) |
| Password field | "Password" (visible label above it; input masked) | 126 / 151 px |
| Button | "Log In" | 126 / 145 px |
| Link | "Forgot your password?" | 126 / 126 px touch target |

At 200% ([c4-android-login-font-200.png](c4-android-login-font-200.png)) every Kindred label, field,
button and link is fully visible, nothing overlaps, and the content sits in a scroll view. Typed text
([c4-android-login-font-200-typed.png](c4-android-login-font-200-typed.png), synthetic address) renders at
full height and scrolls horizontally inside the field, as standard single-line inputs do. The only
truncated text on screen is the development client's own "Tools" label.

Android 14 and later scale large text non-linearly, so at the 200% setting our 16 to 17 px labels grew
about 1.7 times rather than exactly 2 times. That is the platform's maximum, so this is the strongest
test Android allows.

Contrast: all nine declared text and background pairs pass WCAG 2.2 AA (`npm run check:tokens`); every
token is a flagged placeholder.

**Result (Android emulator half): passed, against placeholder tokens.** The iOS Dynamic Type check is
**Blocked** until the iOS simulator run.

## Criteria not covered by this run

| Criterion | Status |
| --- | --- |
| 3 Visual match to Figma | **Provisional.** Placeholder tokens; no approved tokens or mockups yet |
| 15 Physical devices | **Blocked.** No physical Android phone yet; Apple Developer enrollment paused |
