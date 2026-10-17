# 0018. Dependency scanning, exceptions and inventory

- Status: Accepted
- Date: 2026-10-17
- Source: Section 3 required checks ("Dependency scan"), Section 9 dependencies ("known-vulnerable
  packages block release unless an ADR records the reason"); decision 103

## Decision

CI job `dependency-scan`:

1. **NuGet**: `NuGetAudit` runs on every restore with warnings as errors, and
   `dotnet list package --vulnerable --include-transitive` fails the job on any finding. Package versions
   are central (`Directory.Packages.props`) and locked (`packages.lock.json`, locked mode in CI).
2. **npm**: `scripts/dev/check-npm-audit.mjs` runs `npm audit` for `apps/mobile` and `scripts/codegen`.
   High and critical advisories fail the job unless listed in
   [`docs/security/dependency-exceptions.json`](../../security/dependency-exceptions.json) with a reason,
   this ADR, and a review date; an expired exception fails the job. Moderate and low advisories are
   reported as warnings.
3. **Inventory**: CycloneDX SBOMs for the backend (`dotnet CycloneDX`) and the mobile app
   (`npm sbom`) are uploaded as a build artifact on every run.

Dependabot alerts are enabled on the repository (free). GitHub dependency review is not used on this
private repository because it needs the paid Code Security add-on.

## Exceptions accepted on 2026-10-17 (review by 2027-01-15)

| Advisory | Package | Why it is accepted |
| --- | --- | --- |
| GHSA-vfj7-8cjw-p6xm (high) | braces | Reached only through Expo's Metro bundler and Jest at build and test time; not in the app bundle. No patched release exists. |
| GHSA-86w9-cpqp-85rv (high) | node-forge | Reached only through the Expo CLI on developer machines; not in the app bundle and never used to verify untrusted signatures. No patched release exists. |

Two moderate advisories (`uuid` through Expo config plugins at prebuild time, `sprintf-js` through Jest)
are reported as warnings. Each exception is reviewed when Expo ships an update or by the review date,
whichever is first.
