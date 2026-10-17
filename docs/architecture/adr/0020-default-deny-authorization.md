# 0020. Default-deny fallback authorization

- Status: Accepted (implemented in Milestone 1)
- Date: 2026-10-17
- Source: Section 6 "Default deny", Section 6a Authorization, Section 10 criterion 10; decisions 65 and 109

## Decision

- The authorization **fallback policy**, applied to every endpoint with no authorization metadata, is a
  requirement no handler satisfies, so the endpoint rejects every request. The **default policy** (a bare
  `[Authorize]`) is the same deny-all policy, so `[Authorize]` alone grants nothing.
- An endpoint declares its access with exactly one of:
  - `[RequirePermission("clients.read")]`, naming a permission from the fixed catalog
    (`PermissionCatalog`). An unknown permission resolves to deny-all. Milestone 1 registers no handler
    for permissions, so even a declared permission is denied until the Phase 2 access evaluator exists:
    the system fails closed.
  - `[PublicEndpoint("reason")]`, with a mandatory reason. Raw `[AllowAnonymous]` is forbidden.
- Health (`GET /v1/health`) is the only public endpoint in Milestone 1. Section 6a also allows the
  sign-in flow and the consent-link routes later; each must be added to the allowlist in
  `EndpointDeclarationTests` in a reviewed change.
- Milestone 1 has no sign-in, so the `Kindred.NoSignIn` authentication scheme authenticates nobody: any
  token a caller sends is ignored and protected requests get 401 problem details. Phase 2 replaces it with
  Cognito JWT validation.
- The OpenAPI document is generated at build time and not served at runtime, so it is not a second public
  endpoint.

## How the build fails

`Kindred.ArchitectureTests` (security trait): every controller action declares a permission or is
public; `[AllowAnonymous]` is never used; declared permissions exist in the catalog; and the running app's
endpoint table contains exactly the allowlisted public endpoints. `Kindred.IntegrationTests`
(`DefaultDenyTests`) adds an undeclared probe controller to a test host and proves it returns 401 with no
token, a fake bearer token, an unsigned `alg: none` token and Basic credentials, and that a mutation is
refused before its body is read.
