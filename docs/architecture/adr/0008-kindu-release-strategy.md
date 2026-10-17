# 0008. Kindu: Coming Soon in V1.0, behind a provider abstraction

- Status: Accepted
- Date: 2026-10-17
- Source: Section 2 Kindu release strategy (decided October 16, 2026), Section 7; decision 87

## Decision

- V1.0 shows a clearly labelled "Kindu -- Coming Soon" screen, gated by `kindu.use`, with no
  client-specific content and no live AI provider.
- `IKinduProvider` with `PlaceholderKinduProvider` for development and test only. A configuration
  setting chooses the mode and the API refuses to start in production with the placeholder enabled.
- V1.2 (tentative) adds real features only with authorization, privacy controls, vendor agreements,
  security testing and human oversight. The mobile app never talks to an AI vendor.

## Consequences

Built in Phase 10 (backlog B35). Schema for V1.2 is added in V1.2.
