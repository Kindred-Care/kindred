# Kindred

Caregiver and agency management platform. This repository holds the Expo mobile app, the ASP.NET
Core API, the database migrations, the design tokens and the project documentation.

> **Status:** Milestone 1 (Walking Skeleton) is in progress. It is local-only: no cloud resources, no
> sign-in, no features, and synthetic data only. See the approved Phase 0 blueprint, Section 10.

## Repository layout

| Path | Contents |
| --- | --- |
| `apps/mobile/` | Expo + Expo Router + TypeScript app |
| `apps/web/` | Reserved and empty in V1 |
| `backend/` | `Kindred.Api`, `Kindred.Application`, `Kindred.Domain`, `Kindred.Infrastructure` and the three test projects |
| `docs/architecture/` | ADRs (`adr/`) and the feature availability matrix |
| `docs/api/` | The committed OpenAPI document and the client generation guide |
| `docs/security/` | Review checklist and security notes |
| `docs/product/` | Requirements traceability |
| `design/` | Design tokens (source of truth) and exports |
| `scripts/` | Development (`dev/`), seed (`seed/`) and code generation (`codegen/`) scripts |
| `.github/` | CI workflows, CODEOWNERS, pull request template |

## Contributing

`main` is protected: changes land only through pull requests whose required checks pass, with no
direct pushes, force pushes or branch deletion, and the rules apply to administrators too. Work through
[the review checklist](docs/security/review-checklist.md) for every pull request.

The getting-started guide is added with the backend and mobile scaffolds.
