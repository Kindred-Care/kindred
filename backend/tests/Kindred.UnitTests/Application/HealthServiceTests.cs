using Kindred.Application.Authorization;
using Kindred.Application.Health;

namespace Kindred.UnitTests.Application;

public sealed class HealthServiceTests
{
    private sealed class StubProbe(Func<Task<bool>> result) : IDatabaseHealthProbe
    {
        public Task<bool> CanConnectAsync(CancellationToken cancellationToken) => result();
    }

    [Fact]
    public async Task REQ_PLAT_002_reachable_database_is_healthy()
    {
        var report = await new HealthService(new StubProbe(() => Task.FromResult(true))).CheckAsync(TestContext.Current.CancellationToken);

        Assert.Equal(new HealthReport(HealthStatus.Healthy, HealthStatus.Healthy), report);
    }

    [Fact]
    public async Task REQ_PLAT_002_unreachable_database_is_unhealthy()
    {
        var report = await new HealthService(new StubProbe(() => Task.FromResult(false))).CheckAsync(TestContext.Current.CancellationToken);

        Assert.Equal(new HealthReport(HealthStatus.Unhealthy, HealthStatus.Unhealthy), report);
    }

    [Fact]
    public async Task REQ_PLAT_002_a_throwing_probe_is_unhealthy_not_an_error()
    {
        var probe = new StubProbe(() => throw new InvalidOperationException("connection refused"));

        var report = await new HealthService(probe).CheckAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HealthStatus.Unhealthy, report.Status);
    }

    [Fact]
    public void REQ_SEC_001_the_milestone_1_permission_catalog_is_empty()
    {
        // Permissions arrive with the Phase 2 access evaluator. Until then nothing can be granted.
        Assert.Empty(PermissionCatalog.All);
        Assert.False(PermissionCatalog.IsKnown("clients.read"));
    }
}
