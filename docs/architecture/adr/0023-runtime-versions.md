# 0023. .NET 10 LTS and Node.js 22 LTS

- Status: Accepted
- Date: 2026-10-17
- Source: engineering decision under the decision-making rules (no version is fixed by the blueprint)

## Decision

- **.NET 10** (LTS, supported to November 2028), SDK 10.0.402 pinned in `global.json` with
  `latestFeature` roll-forward, and the Microsoft Testing Platform runner. .NET 9 was rejected because its
  support ends in November 2026.
- **Node.js 22** (LTS) for the app tooling and scripts, recorded in `.nvmrc` and `package.json` engines.
- **Expo SDK 58** with React Native 0.88 and TypeScript 6.0 for the app (ADR 0013).
- Warnings are errors in the backend build; packages are centrally versioned and locked.

## Consequences

Upgrades are deliberate pull requests that pass every required check.
