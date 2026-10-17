using Kindred.Api.Authorization;
using Kindred.Api.Errors;
using Kindred.Api.Logging;
using Kindred.Api.Middleware;
using Microsoft.Extensions.Logging;

namespace Kindred.UnitTests.Api;

public sealed class LogRedactorTests
{
    // Token-shaped test values are assembled at runtime so no secret-shaped literal is committed
    // (the gitleaks scan stays strict, with no test-folder allowlist).
    private static readonly string _fakeJwt = string.Join('.', "ey" + "JhbGciOiJIUzI1NiJ9", "ey" + "JzdWIiOiIxMjM0NTYifQ", "c2lnbmF0dXJl");

    public static TheoryData<string, string> Samples => new()
    {
        { "Authorization: Bearer abc.def-123_456", "Bearer [REDACTED]" },
        { "token=" + "sk_" + "test_1234567890", "token=[REDACTED]" },
        { "password: hunter2", "password=[REDACTED]" },
        { $"jwt {_fakeJwt} here", "jwt [REDACTED] here" },
        { "contact mary.example@example.com now", "contact [REDACTED] now" },
    };

    [Theory]
    [MemberData(nameof(Samples))]
    public void REQ_PLAT_006_credentials_and_emails_are_redacted(string input, string expectedFragment)
    {
        var redacted = LogRedactor.Redact(input);

        Assert.Contains(expectedFragment, redacted, StringComparison.Ordinal);
    }

    [Fact]
    public void REQ_PLAT_006_ordinary_text_is_unchanged()
    {
        Assert.Equal("HTTP GET v1/health responded 200", LogRedactor.Redact("HTTP GET v1/health responded 200"));
    }

    [Fact]
    public void REQ_PLAT_006_exception_messages_are_withheld_but_stack_traces_kept()
    {
        Exception original;
        try
        {
            throw new InvalidOperationException("Client Mary Example not found");
        }
        catch (InvalidOperationException ex)
        {
            original = ex;
        }

        var safe = new WithheldMessageException(original);

        Assert.DoesNotContain("Mary", safe.ToString(), StringComparison.Ordinal);
        Assert.Contains(nameof(REQ_PLAT_006_exception_messages_are_withheld_but_stack_traces_kept), safe.ToString(), StringComparison.Ordinal);
    }
}

public sealed class ExceptionTextInMessageTests
{
    [Fact]
    public void REQ_PLAT_006_exception_text_embedded_in_a_message_is_withheld()
    {
        // Shaped like EF Core's query-failure message, with a database error that quotes a data value.
        var inner = new InvalidOperationException("23505: duplicate key value violates unique constraint. Key (email)=(marigold@example.org) already exists.");
        var outer = new InvalidOperationException("An exception has been raised that is likely due to a transient failure.", inner);
        var message = $"An exception occurred while iterating over the results of a query.{Environment.NewLine}{outer}";

        var safe = RedactingLoggerProvider.WithholdExceptionText(message, outer);

        Assert.DoesNotContain("marigold", safe, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("duplicate key", safe, StringComparison.Ordinal);
        Assert.StartsWith("An exception occurred while iterating over the results of a query.", safe, StringComparison.Ordinal);
    }

    [Fact]
    public void REQ_PLAT_006_driver_error_fields_in_exception_data_are_withheld()
    {
        var error = new InvalidOperationException("23505: duplicate key");
        error.Data["Detail"] = "Key (email)=(marigold@example.org) already exists.";
        var message = $"Query failed.{Environment.NewLine}{error}{Environment.NewLine}Exception data:{Environment.NewLine}    Detail: {error.Data["Detail"]}";

        var safe = RedactingLoggerProvider.WithholdExceptionText(message, error);

        Assert.DoesNotContain("marigold", safe, StringComparison.OrdinalIgnoreCase);
    }
}

public sealed class RedactingScopeProviderTests
{
    [Fact]
    public void REQ_PLAT_006_request_path_scopes_are_withheld_and_values_redacted()
    {
        var scopes = new LoggerExternalScopeProvider();
        var provider = new RedactingScopeProvider(scopes);
        using var _ = provider.Push(new Dictionary<string, object>
        {
            ["RequestPath"] = "/v1/clients/Marigold%20Fakeclient",
            ["RequestId"] = "0HN1",
            ["Note"] = "Authorization: Bearer abc.def",
        });

        var rendered = new List<string>();
        provider.ForEachScope((scope, list) => list.Add(scope!.ToString()!), rendered);

        var text = Assert.Single(rendered);
        Assert.DoesNotContain("Marigold", text, StringComparison.Ordinal);
        Assert.DoesNotContain("abc.def", text, StringComparison.Ordinal);
        Assert.Contains("RequestPath:" + RedactingScopeProvider.Withheld, text, StringComparison.Ordinal);
        Assert.Contains("RequestId:0HN1", text, StringComparison.Ordinal);
    }
}

public sealed class CorrelationIdTests
{
    [Theory]
    [InlineData("0192a5b4c3d24e7f8a9b0c1d2e3f4a5b", true)]
    [InlineData("abc", false)]
    [InlineData("Mary Example's request", false)]
    [InlineData(null, false)]
    public void REQ_PLAT_005_only_opaque_correlation_ids_are_accepted(string? value, bool accepted)
    {
        Assert.Equal(accepted, CorrelationId.IsAcceptable(value));
    }
}

public sealed class DefaultDenyPolicyTests
{
    private readonly PermissionPolicyProvider _provider = new();

    [Fact]
    public async Task REQ_SEC_001_fallback_and_default_policies_deny_everything()
    {
        Assert.Same(PermissionPolicyProvider.DenyAll, await _provider.GetFallbackPolicyAsync());
        Assert.Same(PermissionPolicyProvider.DenyAll, await _provider.GetDefaultPolicyAsync());
        Assert.IsType<DenyAllRequirement>(Assert.Single(PermissionPolicyProvider.DenyAll.Requirements));
    }

    [Fact]
    public async Task REQ_SEC_001_an_unknown_permission_resolves_to_deny_all()
    {
        Assert.Same(PermissionPolicyProvider.DenyAll, await _provider.GetPolicyAsync(RequirePermissionAttribute.PolicyPrefix + "clients.read"));
        Assert.Same(PermissionPolicyProvider.DenyAll, await _provider.GetPolicyAsync("anything-else"));
    }

    [Fact]
    public void REQ_SEC_002_public_endpoints_must_state_a_reason()
    {
        Assert.Throws<ArgumentException>(() => new PublicEndpointAttribute(" "));
    }

    [Fact]
    public void REQ_PLAT_004_error_titles_are_fixed_per_status()
    {
        Assert.Equal("Sign-in is required.", ProblemResponses.TitleFor(401));
        Assert.Equal("Something went wrong.", ProblemResponses.TitleFor(500));
    }
}
