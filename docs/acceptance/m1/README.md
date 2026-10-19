# Milestone 1 acceptance evidence

Evidence for the Section 10 acceptance criteria, collected as each check runs. Only synthetic data appears
here. Results are reported exactly as observed: a check that could not run is listed as Blocked or Not
yet run, never as Passed.

## Status of all 15 criteria (updated 2026-10-17, after the approved splash and Log In were built)

Status values: **Passed** (verified with the evidence shown), **Partial** (part verified, the rest named),
**Provisional** (built, but acceptance needs a named input: placeholders, or a comparison not yet possible), **Blocked** (cannot complete until a named prerequisite is met).

| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | `docker compose up` plus one command starts PostgreSQL and the API; health 200 with a database check | **Passed** (Windows, recorded; Linux, CI smoke step on PR #2) | [c1-compose-run.txt](c1-compose-run.txt), [github-ci-evidence.md](github-ci-evidence.md) |
| 2 | Splash then Log In, no console errors, on an iOS simulator and an Android emulator | **Partial**: Android emulator re-run on the approved design and passed (release build: 0 error lines in 10 of 10 cold starts; no JavaScript errors or warnings in any run; one intermittent native warning in development builds only, explained below); iOS simulator **Blocked** (needs the Mac) | Android section below |
| 3 | Splash and Log In match the Figma at 390 pt using tokens, no inline hex | **Provisional, not measured**: built from approved tokens and Inter, no inline hex (lint-enforced). The ±2 pt comparison at 390 and 402 pt **cannot be made** until the Figma frame exports (P1) are provided; spacing the handoff does not give is a documented default until then | Design brief 6b and 6c; ADR 0022 |
| 4 | Log In screen reader labels, 200% dynamic type without clipping, contrast | **Partial**: Android re-run on the approved design and passed (approved values; all 11 contrast pairs AA); iOS Dynamic Type **Blocked** | Android section below |
| 5 | CI on every pull request runs every required check, security suite separate, all pass | **Passed** | [github-ci-evidence.md](github-ci-evidence.md) |
| 6 | Every project has a passing unit test; a README gets a new developer running both apps in under 30 minutes | **Partial**: tests pass for every project; the timed walkthrough needs a developer other than the author | [local-full-run.txt](local-full-run.txt) |
| 7 | No secrets in the repository; `.env.example` documents every variable; gitleaks | **Passed** (`secret-scan` on full history in CI; pre-commit hook) | [github-ci-evidence.md](github-ci-evidence.md) |
| 8 | Protected `main` with required checks, initial ADRs, traceability, script guards exercised by CI | **Passed** | [ADR 0016 evidence](../../architecture/adr/evidence/0016-enforcement.md), ADR index, traceability |
| 9 | Direct push, force push, deletion and failing-check merge each rejected, recorded in an ADR | **Passed** | [ADR 0016 evidence](../../architecture/adr/evidence/0016-enforcement.md) |
| 10 | Undeclared endpoint denied and fails the build; health the only public endpoint | **Passed** (probe PR #3 failed `security-tests`) | [github-ci-evidence.md](github-ci-evidence.md) |
| 11 | Fake token and fake client name never reach the logs | **Passed** (after two leak fixes; CI `security-tests` on PR #2) | [c11-captured-logs.txt](c11-captured-logs.txt), ADR 0021 |
| 12 | API change without regenerating the client fails CI; breaking change flagged | **Passed** (probe PRs #4 and #5) | [github-ci-evidence.md](github-ci-evidence.md) |
| 13 | EF baseline applies to an empty database; app role cannot change schema; version and extensions recorded | **Passed** | [c13-postgres.json](c13-postgres.json), [c13-compose-roles.txt](c13-compose-roles.txt) |
| 14 | Seed and dev scripts refuse outside local; seed data synthetic | **Passed** (`repo-checks` in CI) | [github-ci-evidence.md](github-ci-evidence.md) |
| 15 | EAS development build on one physical iOS and one physical Android device | **Blocked**: no physical Android phone yet; Apple Developer enrollment paused; the EAS project is not yet created (needs `npx eas-cli login`) | — |

**Summary:** 10 Passed (1, 5, 7 to 14), 3 Partial (2, 4, 6), 1 Provisional (3, not yet measurable), 1 Blocked (15).
The 10 Passed criteria come from earlier runs; this branch changes only the mobile screens, the design
tokens and their generator, and CI re-runs every check on its pull request.
Milestone 1 is not fully accepted until criterion 15 passes on both devices or the founder authorizes an
exception (Section 10).

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

## Android emulator run on the approved design (criteria 2 and 4, Android half) — 2026-10-17

Re-run after the founder-approved splash and Log In were built (branch `feat/m1-figma-screens`). The
earlier run on placeholder tokens is superseded; its files were replaced, and git history keeps them,
including the CMake 4 compatibility notes.

### Environment

| Item | Value |
| --- | --- |
| Host | Windows 11 Pro, `LongPathsEnabled = 1` |
| Emulator | Android Studio "Medium Phone API 37.0" (`sdk_gphone64_x86_64`), 1080 × 2400 at 420 dpi (411 × 914 dp) |
| Builds | Expo development build (`npx expo run:android`, debug, Metro) and a local release build (`--variant release`: JavaScript bundled, debug-signed, nothing uploaded) |
| JDK / Gradle / CMake | Android Studio bundled OpenJDK; Gradle 9.4.1; CMake 4.1.2 selected with `cmake.dir` |

### Splash, then Log In (criterion 2, Android emulator)

A cold start from the launcher was screen-recorded ([c2-android-run.mp4](c2-android-run.mp4)) while 40
screenshots were taken back to back. Sampled background colours:

| Frames | Screen | Colour |
| --- | --- | --- |
| 1 | Launcher | — |
| 2 to 8 | Native launch screen, Warm White with no artwork ([c2-android-0-native-splash.png](c2-android-0-native-splash.png)) | `#FCFBF8` |
| 9 to 18 | Development client loading screen (development builds only; not Kindred UI) | `#FAFAFA` |
| 19 onwards | Kindred splash, wordmark and tagline in Inter, then Log In ([c2-android-1-splash.png](c2-android-1-splash.png), [c2-android-2-login.png](c2-android-2-login.png)) | `#FCFBF8` |

The native launch screen and the splash share Warm White, so there is no colour flash. The blue "Tools"
button is the development client's menu and exists only in development builds.

**Console errors.**

| Build | Cold starts | Error or fatal lines | JavaScript errors or warnings |
| --- | --- | --- | --- |
| Release (no development menu) | 10, from the launcher | **0 in 10 of 10** ([c2-android-release-logcat.txt](c2-android-release-logcat.txt) is the first) | 0 |
| Development | 5, from the launcher | 0 in 4 of 5; one run logged the native warning below | 0 |
| Development | 3, while screen-recording or opened by the dev-client link | each logged the same native warning ([c2-android-app-logcat.txt](c2-android-app-logcat.txt)) | 0 |

The one error-level entry is a single `ReactNoCrashSoftException`, printed by React Native's `ReactHost`
as a 42-line stack trace: "Tried to access onWindowFocusChange while context is not ready". It is raised
through `expo.modules.devmenu.detectors.InterceptingWindowCallback` (the development menu) when the
window gains focus before React Native has started, before any Kindred JavaScript runs. It is
non-fatal and timing-dependent, and it is **absent from the release build**, which has no development
menu. It is not Kindred code. The only `ReactNativeJS` line in every run is the informational
`Running "main"`. The logs contain no email address, password or token.

**Result (Android emulator half): passed** for what a user runs (the release build: 0 errors in 10
cold starts). The development-menu warning is recorded here, not hidden. The iOS simulator half is
**Blocked**: it needs macOS.

### Screen reader labels, 200% text and layout (criterion 4, Android emulator)

Accessibility trees were dumped at 100%, at Android's maximum 200% font size, and at 200% on a narrow
screen (density raised so the screen is 309 dp wide)
([c4-android-a11y-tree-100.xml](c4-android-a11y-tree-100.xml),
[c4-android-a11y-tree-200.xml](c4-android-a11y-tree-200.xml),
[c4-android-a11y-tree-200-narrow.xml](c4-android-a11y-tree-200-narrow.xml)).

| Element | Announced as | 100%, 411 dp wide | 200%, 411 dp wide | 200%, 309 dp wide |
| --- | --- | --- | --- | --- |
| Wordmark | "Kindred" (heading) | 77 dp tall | 80 dp (capped at 1.5×) | 80 dp |
| Tagline | "Care for Every Chapter." | one line | wraps to two lines | wraps |
| Username field | "Username" (the visible "Username:" is hidden from screen readers so it is not read twice) | 52 dp, label **beside** | 62 dp, label beside | 62 dp, label **above** |
| Password field | "Password", masked | 52 dp, label beside | 63 dp, label beside | 62 dp, label above |
| Button | "Log In" (button) | 52 dp | 64 dp | 64 dp |
| Link | "Forgot your password?" (link) | 48 dp touch target | 48 dp | 55 dp, wraps |

There is no "Log In" heading; "Log In" appears only on the button. At 100% the side margins are 24 dp
and both fields share a left edge. At 200% on the 411 dp screen the labels stay beside their fields, as
the design brief's rule requires (148 dp label + 12 dp gap + 160 dp minimum field = 320 dp, within the
363 dp content width; [c4-android-login-font-200.png](c4-android-login-font-200.png)). On the 309 dp
screen they no longer fit and stack above their fields
([c4-android-login-font-200-narrow.png](c4-android-login-font-200-narrow.png)). There the content is
taller than the screen and scrolls; scrolled to the end, the wrapped link is fully visible
([c4-android-login-font-200-narrow-scrolled.png](c4-android-login-font-200-narrow-scrolled.png)). No
Kindred text is truncated or overlapped in any capture. The development client's floating menu button
sits over the wordmark on the narrow screen; it exists only in development builds.

Android 14 and later scale large text non-linearly, so at the 200% setting the 16 pt labels grew about
1.5 times and the 24 pt tagline less. That is the platform's maximum.

Contrast: all 11 declared pairs pass WCAG 2.2 AA using approved values (`npm run check:tokens`):
Charcoal on Warm White 12.94:1, typed text on White 13.39:1, white on the `#A94F32` button 5.45:1, the
field border 4.39:1 and 4.54:1, the focus border `#A94F32` 5.27:1 and 5.45:1 (set by the founder 2026-10-18). On the emulator, moving keyboard focus to Username with the Tab key drew a 2 dp border whose pixels are exactly `#A94F32`, while Password kept its 1 dp `#767676` border ([c4-android-login-focused.png](c4-android-login-focused.png)), the button against the page 5.27:1.

Not captured on the emulator: typing into a focused field. The emulator's keyboard opened its
handwriting tutorial over the app, so those two captures were discarded. Focus (2 pt `#A94F32` border on both fields
at an unchanged height), masking and typing are covered by `LogInScreen.test.tsx`.

**Result (Android emulator half): passed.** The iOS Dynamic Type check is **Blocked** until the iOS
simulator run.

### Found and fixed during this run

| Finding | Fix |
| --- | --- |
| Fields drew 48 dp tall on Android, not the specified 14 + 24 + 14 = 52 pt. Android's text input does not size itself from line height, so the 48 dp touch-target minimum set the height. That is outside the ±2 pt tolerance | The fields' minimum height is now 52 pt (`FIELD_MIN_HEIGHT`, tested) and was re-measured on the emulator at 52 dp |
| Metro had been started with `CI=1`, which turns off file watching, so the app briefly ran stale code after that fix | Metro restarted with watching and a cleared cache before the captures above |

## Criteria not covered by this run

| Criterion | Status |
| --- | --- |
| 3 Visual match to Figma | **Provisional, not measured.** Approved tokens are in use, but the ±2 pt side-by-side comparison at 390 and 402 pt needs the Figma frame exports (P1, design brief section 6c). No claim is made until they are compared |
| 15 Physical devices | **Blocked.** No physical Android phone yet; Apple Developer enrollment paused |
