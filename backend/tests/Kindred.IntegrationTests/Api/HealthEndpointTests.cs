using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Kindred.IntegrationTests.Support;

namespace Kindred.IntegrationTests.Api;

[Collection(PostgresCollection.Name)]
public sealed class HealthEndpointTests(PostgresFixture database)
{
    [Fact]
    public async Task REQ_PLAT_002_health_returns_200_with_a_healthy_database_check()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/v1/health", UriKind.Relative), TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("healthy", body.GetProperty("status").GetString());
        Assert.Equal("healthy", body.GetProperty("checks").GetProperty("database").GetString());
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task REQ_PLAT_002_health_returns_503_when_the_database_is_unreachable()
    {
        // Nothing listens on port 1, so the connection is refused at once.
        await using var factory = new KindredApiFactory("Host=127.0.0.1;Port=1;Database=kindred;Username=kindred_app;Password=x;Timeout=2");
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/v1/health", UriKind.Relative), TestContext.Current.CancellationToken);
        var text = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Contains("\"database\":\"unhealthy\"", text, StringComparison.Ordinal);
        Assert.DoesNotContain("Npgsql", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("127.0.0.1", text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task REQ_PLAT_005_every_response_carries_a_correlation_id()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString);
        using var client = factory.CreateClient();

        using var generated = await client.GetAsync(new Uri("/v1/health", UriKind.Relative), TestContext.Current.CancellationToken);
        using var request = new HttpRequestMessage(HttpMethod.Get, "/v1/health");
        request.Headers.Add("X-Correlation-Id", "0192a5b4c3d24e7f8a9b0c1d2e3f4a5b");
        using var echoed = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Matches("^[0-9a-f]{32}$", generated.Headers.GetValues("X-Correlation-Id").Single());
        Assert.Equal("0192a5b4c3d24e7f8a9b0c1d2e3f4a5b", echoed.Headers.GetValues("X-Correlation-Id").Single());
    }
}
