# Milestone 1 acceptance evidence

Evidence for the Section 10 acceptance criteria, collected as each check runs. Only synthetic data appears
here. Results are reported exactly as observed: a check that could not run is listed as Blocked or Not
yet run, never as Passed.

## Status of all 15 criteria (2026-10-17)

"Local evidence" means verified on the founder's Windows machine. GitHub CI has not run yet, because it
starts with the first pull request and needs GitHub CLI sign-in to set up the protections first.

| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | `docker compose up` plus one command starts PostgreSQL and the API; health 200 with a database check | **Passed (local)**; CI smoke step added | [c1-compose-run.txt](c1-compose-run.txt) |
| 2 | Splash then Log In, no console errors, iOS simulator and Android emulator | **Android passed; iOS Blocked** (needs the Mac) | Android section below |
| 3 | Splash and Log In match Figma at 390 pt using tokens | **Provisional** (placeholder tokens, no approved mockups) | ADR 0022 |
| 4 | Log In screen reader labels, 200% dynamic type, contrast | **Android passed, against placeholder tokens; iOS Blocked** | Android section below |
| 5 | CI on every pull request runs every check, all pass | **Not yet run on GitHub**; all 20 checks pass locally | [local-full-run.txt](local-full-run.txt) |
| 6 | Every project has a passing unit test; README gets a new developer running in under 30 minutes | **Partial**: tests pass; the timed walkthrough by a new developer has not been done | [local-full-run.txt](local-full-run.txt) |
| 7 | No secrets; `.env.example` documents every variable; gitleaks | **Passed (local)**; CI run pending | gitleaks clean in [local-full-run.txt](local-full-run.txt) |
| 8 | Protected main with required checks, ADRs, traceability, script guards in CI | **Blocked** (protections not yet applied: GitHub CLI sign-in) | ADR 0016 |
| 9 | Direct push, force push, deletion and failing-check merge each rejected | **Blocked** (same) | ADR 0016 |
| 10 | Undeclared endpoint denied and fails the build; health the only public endpoint | **Passed (local)**; CI run pending | `security-arch`, `security-integration` in [local-full-run.txt](local-full-run.txt) |
| 11 | Fake token and fake client name never reach the logs | **Passed (local)** after two fixes; CI run pending | [c11-captured-logs.txt](c11-captured-logs.txt), ADR 0021 |
| 12 | API change without client regeneration fails CI; breaking change flagged | **Not yet run on GitHub** (the check runs only in CI) | ADR 0014, 0015 |
| 13 | EF baseline applies to an empty database; app role cannot change schema; version and extensions recorded | **Passed (local)**; CI run pending | [c13-postgres.json](c13-postgres.json), [c13-compose-roles.txt](c13-compose-roles.txt) |
| 14 | Seed and dev scripts refuse outside local; seed synthetic | **Passed (local)**; CI run pending | `script-tests` in [local-full-run.txt](local-full-run.txt) |
| 15 | EAS development build on one physical iOS and one physical Android device | **Blocked** (no Android phone yet; Apple Developer enrollment paused; EAS project not yet created) | — |

## Docker stack and integration tests (criteria 1, 10, 11, 13) — 2026-10-17

Docker Desktop with Docker Engine 29.8.2 (Linux containers, WSL2), Compose 5.6.0, PostgreSQL `postgres:18.6`.

**Criterion 1.** After `npm run setup` (creates `.env`, installs the git hooks), one command,
`docker compose up --build --detach`, started PostgreSQL, ran the baseline migration once as
`kindred_migrator` (exit 0) and started the API as `kindred_app`. From an empty database volume and with
images already cached, `GET /v1/health` returned `200 {"status":"healthy","checks":{"database":"healthy"}}`
10 seconds after the command started. A first-ever build also downloads base images and takes longer.
With the database stopped the endpoint returned `503 {"status":"unhealthy",...}` with no internal detail,
and it recovered to 200 when the database restarted.

The migration log's "Failed executing DbCommand ... `__ef_migrations_history`" line is EF Core's normal
first-run probe of an empty database before the history table exists; the migration then applies and
prints `Done.`

**Integration tests.** 25 of 25 pass against a real PostgreSQL 18.6 container: 16 in `test-integration`
and 9 in the security suite. The first run failed 3 tests, all real findings:

| Finding | Kind | Fix |
| --- | --- | --- |
| Role-attribute test expected `false`, PostgreSQL prints `f` | Test bug; the attributes were correct | Expectation corrected |
| Unknown routes return 401, not 404 | Design behaviour: the fallback policy also covers unmatched requests | Kept on purpose (no route enumeration); recorded in ADR 0020; test now asserts it |
| A fake client name in a URL path reached the logs through ASP.NET Core's request scope | **Real leak** | Scopes are sanitized for every provider (ADR 0021) |

Stopping the database under the running API then exposed a second leak route: EF Core embeds the full
exception text, including PostgreSQL's error fields, inside its log message. That is now withheld too
(ADR 0021). After both fixes, the API container's logs for an outage contain no raw database error
text and no credentials, and the full console output of the integration run contains neither the fake
token nor the fake client name.

**Criterion 13.** Recorded by the integration test ([c13-postgres.json](c13-postgres.json)): server
18.6, `btree_gist` 1.8 and `pg_trgm` 1.6 available, matching the AWS RDS for PostgreSQL 18
documentation (ADR 0019). The baseline applied to a brand-new empty database. On the compose database
([c13-compose-roles.txt](c13-compose-roles.txt)) `kindred_app` is refused `CREATE TABLE` and
`DROP TABLE` and has no elevated attributes. `kindred_bootstrap` is the container's initialization
superuser (the local stand-in for the RDS master user); the API and migrations never use it.

**Local run of every CI check.** All 20 pass ([local-full-run.txt](local-full-run.txt)): 32 unit, 16
integration, 4 architecture, 14 security-trait, 11 mobile and 33 script tests; lint, type check, both
builds, the bundle guard, design tokens, traceability (465 requirements), feature matrix (65
permissions), gitleaks, and the NuGet and npm vulnerability gates.

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
