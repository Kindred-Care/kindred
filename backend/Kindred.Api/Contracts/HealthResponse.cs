using Kindred.Application.Health;

namespace Kindred.Api.Contracts;

/// <summary>Result of GET /v1/health. Carries no version, host or error details.</summary>
public sealed record HealthResponse(HealthStatus Status, HealthChecks Checks)
{
    public static HealthResponse From(HealthReport report) => new(report.Status, new HealthChecks(report.Database));
}

public sealed record HealthChecks(HealthStatus Database);
