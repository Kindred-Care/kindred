using System.Net.Http.Headers;
using System.Text;
using Kindred.IntegrationTests.Support;

namespace Kindred.IntegrationTests.Api;

/// <summary>
/// Criterion 11: a request carrying a fake token and a fake client name leaves neither in the
/// logs. Logs are captured through the production logging pipeline (request logging that records
/// only the route template, and the redacting provider that withholds exception messages).
/// </summary>
[Trait("Category", "Security")]
[Collection(PostgresCollection.Name)]
public sealed class LogRedactionTests(PostgresFixture database)
{
    private const string FakeToken = "kindred-fake-token-7f3c9a1e5b";
    private const string FakeClientName = "Marigold Fakeclient";

    [Fact]
    public async Task REQ_PLAT_006_fake_token_and_client_name_never_reach_the_logs()
    {
        await using var factory = new KindredApiFactory(database.AppConnectionString, includeProbeControllers: true);
        using var client = factory.CreateClient();
        var encodedName = Uri.EscapeDataString(FakeClientName);

        string[] paths =
        [
            $"/v1/health?client={encodedName}",
            $"/v1/test-probes/undeclared?client={encodedName}",
            $"/v1/no-such-route/{encodedName}",
            $"/v1/test-probes/throws?name={encodedName}",
        ];

        foreach (var path in paths)
        {
            foreach (var method in new[] { HttpMethod.Get, HttpMethod.Post })
            {
                using var request = new HttpRequestMessage(method, path);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", FakeToken);
                request.Headers.Add("X-Client-Name", FakeClientName);
                request.Headers.Add("Cookie", $"session={FakeToken}");
                if (method == HttpMethod.Post)
                {
                    request.Content = new StringContent($"{{\"clientName\":\"{FakeClientName}\",\"token\":\"{FakeToken}\"}}", Encoding.UTF8, "application/json");
                }

                using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
            }
        }

        var logs = factory.Logs.AllText;
        await File.WriteAllTextAsync(Path.Combine(RepositoryPaths.Artifacts, "criterion-11-captured-logs.txt"), logs, TestContext.Current.CancellationToken);

        // The capture worked: one request entry per call and the unhandled error were logged.
        Assert.True(factory.Logs.Entries.Count(e => e.Contains("HTTP ", StringComparison.Ordinal)) >= paths.Length * 2, logs);
        Assert.Contains("CorrelationId=", logs, StringComparison.Ordinal);
        Assert.Contains("Unhandled System.InvalidOperationException", logs, StringComparison.Ordinal);

        Assert.DoesNotContain(FakeToken, logs, StringComparison.Ordinal);
        Assert.DoesNotContain("Marigold", logs, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Fakeclient", logs, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Marigold%20Fakeclient", logs, StringComparison.OrdinalIgnoreCase);
    }
}
