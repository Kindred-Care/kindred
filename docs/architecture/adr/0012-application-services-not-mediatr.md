# 0012. Plain application services, no MediatR

- Status: Accepted
- Date: 2026-10-17
- Source: Section 1 stack concerns (approved October 15, 2026), Section 3 "Deliberately not created yet"

## Decision

Features use plain application services or handlers registered with dependency injection
(`HealthService` is the first). No mediator or command framework: MediatR moved to commercial licensing,
and the indirection is not needed.
