namespace Kindred.Application.Health;

public enum HealthStatus
{
    Healthy,
    Unhealthy,
}

public sealed record HealthReport(HealthStatus Status, HealthStatus Database);

/// <summary>Checks that the database is reachable with the application role.</summary>
public interface IDatabaseHealthProbe
{
    Task<bool> CanConnectAsync(CancellationToken cancellationToken);
}

/// <summary>
/// Backs GET /v1/health. A failing or throwing check is reported as Unhealthy and never surfaces
/// exception details to the caller.
/// </summary>
public sealed class HealthService(IDatabaseHealthProbe database)
{
    public async Task<HealthReport> CheckAsync(CancellationToken cancellationToken)
    {
        var databaseStatus = HealthStatus.Unhealthy;
        try
        {
            if (await database.CanConnectAsync(cancellationToken))
            {
                databaseStatus = HealthStatus.Healthy;
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            databaseStatus = HealthStatus.Unhealthy;
        }

        var overall = databaseStatus == HealthStatus.Healthy ? HealthStatus.Healthy : HealthStatus.Unhealthy;
        return new HealthReport(overall, databaseStatus);
    }
}
