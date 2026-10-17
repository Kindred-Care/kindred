## What and why

<!-- One or two sentences. Link the requirement IDs from docs/product/traceability.md (for example REQ-PLAT-004). -->

Requirements:

## How it was verified

<!-- Commands run, tests added, screenshots for UI changes. Only claim what actually ran. -->

## Checklist

Complete [docs/security/review-checklist.md](../docs/security/review-checklist.md) for every pull request. Tick here once done:

- [ ] Review checklist completed
- [ ] No real client data, Figma photographs or secrets were added (synthetic data only)
- [ ] Tests carry the requirement ID in their name or trait
- [ ] Contract changed? `docs/api/openapi.json` and the generated client are regenerated and committed
- [ ] Breaking API change? Labelled `contract:breaking-approved` with the reason below
- [ ] Destructive migration? Labelled and described with the forward-recovery plan

## High-risk areas touched

<!-- Section 3: authentication, authorization and permissions, the audit chain, tenant isolation
     (Row-Level Security and query filters), file upload and scanning, infrastructure, CI workflows,
     and migrations touching any of those. These need independent review before production deployment. -->

- [ ] None
- [ ] Yes, listed here:
