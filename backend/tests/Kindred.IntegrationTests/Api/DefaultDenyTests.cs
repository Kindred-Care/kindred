using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Kindred.IntegrationTests.Support;

namespace Kindred.IntegrationTests.Api;

/// <summary>
/// Criterion 10 and Section 6a: an endpoint with no declared permission rejects every request,
/// with or without a token, and errors use the standard problem-details shape.
/// </summary>
[Trait("Category", "Security")]
[Collection(PostgresCollection.Name)]
public sealed class DefaultDenyTests(PostgresFixture database)
{
    // An unsigned "alg: none" token claiming to be an administrator, assembled at runtime so no
    // token-shaped literal is committed.
    public static TheoryData<string> Authorizations => new()
    {
        string.Empty,
        "Bearer fake-token-for-default-deny-test",
        "Bearer " + string.Join('.', "ey" + "JhbGciOiJub25lIn0", "ey" + "JzdWIiOiJhZG1pbiJ9", string.Empty),
        "Basic YWRtaW46YWRtaW4=",
    };

    [Theory]
    [MemberData(nameof(Authorizations))]
    public async Task REQ_SEC_001_REQ_SEC_003_an_undeclared_endpoint_is_denied_with_or_without_a_token(string authorization)
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/v1/test-probes/undeclared");
        if (authorization.Length > 0)
        {
            request.Headers.Authorization = AuthenticationHeaderValue.Parse(authorization);
        }

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.DoesNotContain("never be reachable", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task REQ_SEC_001_an_undeclared_mutation_is_denied_before_the_body_is_read()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();
        using var content = new StringContent("{\"anything\":true}", Encoding.UTF8, "application/json");

        using var response = await client.PostAsync(new Uri("/v1/test-probes/undeclared", UriKind.Relative), content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task REQ_PLAT_004_problem_details_carry_status_title_and_correlation_id_only()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/v1/test-probes/undeclared", UriKind.Relative), TestContext.Current.CancellationToken);
        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        var properties = problem.RootElement.EnumerateObject().Select(p => p.Name).Order().ToList();

        Assert.Equal(["correlationId", "status", "title", "type"], properties);
        Assert.Equal(response.Headers.GetValues("X-Correlation-Id").Single(), problem.RootElement.GetProperty("correlationId").GetString());
    }

    [Fact]
    public async Task REQ_SEC_001_an_unknown_route_is_denied_without_revealing_whether_it_exists()
    {
        // The fallback policy also covers requests that match no endpoint, so an unauthenticated caller
        // gets the same 401 for an unknown path as for a protected one and cannot enumerate routes.
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();

        using var unknown = await client.GetAsync(new Uri("/v1/no-such-thing", UriKind.Relative), TestContext.Current.CancellationToken);
        using var undeclared = await client.GetAsync(new Uri("/v1/test-probes/undeclared", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        Assert.Equal(undeclared.StatusCode, unknown.StatusCode);
        Assert.Equal("application/problem+json", unknown.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task REQ_PLAT_004_an_unhandled_error_returns_a_generic_500_without_internals()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(new Uri("/v1/test-probes/throws?name=Rowan%20Testperson", UriKind.Relative), TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Contains("Something went wrong.", body, StringComparison.Ordinal);
        Assert.DoesNotContain("Rowan", body, StringComparison.Ordinal);
        Assert.DoesNotContain("InvalidOperationException", body, StringComparison.Ordinal);
        Assert.DoesNotContain("at Kindred", body, StringComparison.Ordinal);
    }
}
