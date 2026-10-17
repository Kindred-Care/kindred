using Kindred.Application.Health;

namespace Kindred.Api.Contracts;

/// <summary>CONTRACT TEST ONLY, NEVER TO BE MERGED: the "checks" property is removed (a breaking change).</summary>
public sealed record HealthResponse(HealthStatus Status)
{
    public static HealthResponse From(HealthReport report) => new(report.Status);
}
