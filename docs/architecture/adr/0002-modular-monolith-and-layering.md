# 0002. Modular monolith with five-project layering

- Status: Accepted
- Date: 2026-10-17
- Source: Section 2 (approved October 16, 2026), Section 3 Refinement 3, "Deliberately not created yet"

## Context

A solo developer is building a large V1 with strict security rules. Separate services would add
deployment, network and consistency cost without a need that justifies it.

## Decision

One ASP.NET Core API (`Kindred.Api`) with `Kindred.Application`, `Kindred.Domain` and
`Kindred.Infrastructure`, plus the three test projects. Application modules are folders (Identity and
Access, Organizations, Clients, Scheduling and Shifts, Documentation, Documents, Notifications, Kindu,
Audit), not services. The build enforces:

- Domain references no Infrastructure, EF Core, Npgsql or AWS code.
- Application references neither Infrastructure nor Api; Infrastructure does not reference Api.
- Controllers do not use the database context.
- Every endpoint declares its required permission (ADR 0020).

No shared packages folder, API gateway, mediator, generic repository layer or extra mobile state library
is created until a concrete need justifies it.

## Consequences

- `Kindred.ArchitectureTests` fails the build on any layering violation (`LayeringTests`).
- Containers configured by environment variables keep the API portable (Section 2 portability rules).
