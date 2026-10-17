# Kindred

Caregiver and agency management platform: an Expo mobile app, an ASP.NET Core API and PostgreSQL.

> **Status: Milestone 1 (Walking Skeleton).** Local only: no cloud resources, no sign-in, no features,
> synthetic data only. The app shows a splash screen and a static Log In screen; the API has one
> endpoint, `GET /v1/health`. Design tokens are flagged placeholders until approved Figma values arrive.

## Start here (about 20 minutes on a prepared machine)

### 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Git | any recent | `git --version` |
| Docker Desktop (with WSL2 on Windows) | current | `docker compose version` |
| .NET SDK | 10.0.402 or a later 10.0 feature band (`global.json`) | `dotnet --version` |
| Node.js | 22 LTS (`.nvmrc`) | `node --version` |
| gitleaks | 8.x, on your `PATH` (the pre-commit hook needs it) | `gitleaks version` |
| Android Studio with an emulator | current | for the Android app |
| Xcode with an iOS simulator (macOS only) | current | for the iOS app |

On Windows, `winget install Microsoft.DotNet.SDK.10 Docker.DockerDesktop Gitleaks.Gitleaks Google.AndroidStudio`
installs most of these. On macOS, use Homebrew (`brew install --cask docker`, `brew install dotnet gitleaks node@22`).

### 2. One-time setup

```bash
git clone https://github.com/Kindred-Care/kindred.git
cd kindred
npm run setup
```

`npm run setup` creates `.env` from `.env.example` (local-only placeholder values), installs the
gitleaks pre-commit hook and checks your prerequisites. It never overwrites an existing `.env`.

### 3. Start the API and database

```bash
docker compose up --build
```

This starts PostgreSQL 18, runs the database migrations once as the migration role, then starts the API
as the application role. When it is ready:

```bash
curl http://localhost:5080/v1/health
```

returns `{"status":"healthy","checks":{"database":"healthy"}}`. Stop with `Ctrl+C`; reset the database
with `npm run db:reset` (asks you to type a confirmation).

### 4. Start the mobile app

```bash
cd apps/mobile
npm ci
npx expo run:android
```

On a Mac, `npx expo run:ios` builds and opens the iOS simulator. These build a **development build**
(Kindred uses `expo-dev-client`, not Expo Go). After the first build, `npm start` is enough. The splash
screen shows for 1.5 seconds and then Log In. Log In is static in Milestone 1; nothing you type leaves
the screen.

To point the app at the API from an Android emulator, set `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5080`
in `.env`.

## Everyday commands

| Command | What it does |
| --- | --- |
| `docker compose up --build` | Database, migrations and API |
| `dotnet test --project backend/tests/Kindred.UnitTests` | Backend unit tests |
| `dotnet test --project backend/tests/Kindred.IntegrationTests` | API and database tests (needs Docker) |
| `dotnet test --project backend/tests/Kindred.ArchitectureTests` | Layering and default-deny rules |
| `cd apps/mobile && npm test` | Mobile tests (Jest) |
| `cd apps/mobile && npm run lint && npm run typecheck` | ESLint, Prettier and TypeScript |
| `npm run codegen` | Rebuild `docs/api/openapi.json`, the API client and `tokens.ts` |
| `npm run check:tokens` | Token drift and WCAG contrast check |
| `npm run test:scripts` | Tests for the guards, seed, codegen and checks |
| `npm run seed` | Generate synthetic seed data (local only) |

Run the API without Docker with `dotnet run --project backend/Kindred.Api` after setting
`ConnectionStrings__Kindred` to the application role's connection string.

## How the repository is protected

`main` changes only through pull requests whose required checks pass (lint, type check, build, unit,
integration, architecture and mobile tests, the security-trait suite, the API contract check, design
tokens, dependency scan and secret scan) on an up-to-date branch. Direct pushes, force pushes and deleting
`main` are blocked for everyone, administrators included. Work through
[the review checklist](docs/security/review-checklist.md) for every pull request.

Rules that the build enforces:

- Every API endpoint declares its permission; anything else is denied. Health is the only public endpoint.
- No secrets, `.env` files or key material are committed; gitleaks runs before each commit and in CI.
- Synthetic data only. No real client information or Figma or client photographs, anywhere.
- `docs/api/openapi.json` and `apps/mobile/src/api/generated/` are regenerated, never edited by hand.
- Colours and type come from design tokens; inline hex colours fail lint.
- Development scripts refuse to run anywhere but a local machine.

## Repository layout

| Path | Contents |
| --- | --- |
| `apps/mobile/` | Expo + Expo Router + TypeScript app (`app/` thin routes, `src/features/` screens) |
| `apps/web/` | Reserved and empty in V1 |
| `backend/` | `Kindred.Api`, `Kindred.Application`, `Kindred.Domain`, `Kindred.Infrastructure`, `tests/` |
| `design/tokens/` | `tokens.json`, the design token source of truth |
| `docs/architecture/` | [ADRs](docs/architecture/adr/README.md), the [feature matrix](docs/architecture/feature-matrix.md) and the permission catalog |
| `docs/api/` | The committed OpenAPI document and the [client generation guide](docs/api/README.md) |
| `docs/product/` | [Requirements traceability](docs/product/traceability.md) |
| `docs/security/` | Review checklist and dependency exceptions |
| `scripts/` | `dev/` (setup, guards, checks), `seed/`, `codegen/` |
| `.github/` | CI workflow, CODEOWNERS, pull request template |

## Configuration

Every variable is documented in [`.env.example`](.env.example). Only `EXPO_PUBLIC_` variables reach the
app bundle, so nothing secret may use that prefix. Milestone 1 has no cloud credentials, and the scripts
refuse to run if AWS credentials for an unlisted account are present.
