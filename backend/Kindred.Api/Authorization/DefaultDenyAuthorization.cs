using System.Text.Encodings.Web;
using Kindred.Api.Errors;
using Kindred.Application.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Kindred.Api.Authorization;

/// <summary>A requirement no handler ever satisfies.</summary>
public sealed class DenyAllRequirement : IAuthorizationRequirement;

/// <summary>
/// A Section 6 permission. Milestone 1 registers no handler for it, so a declared permission is
/// still denied until the Phase 2 access evaluator is installed: the system fails closed.
/// </summary>
public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}

/// <summary>
/// Builds policies for <see cref="RequirePermissionAttribute"/>. Unknown permissions, an endpoint
/// with no declaration (the fallback) and a bare <c>[Authorize]</c> (the default) all resolve to a
/// policy that can never succeed.
/// </summary>
public sealed class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    public static readonly AuthorizationPolicy DenyAll =
        new AuthorizationPolicyBuilder().AddRequirements(new DenyAllRequirement()).Build();

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => Task.FromResult(DenyAll);

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => Task.FromResult<AuthorizationPolicy?>(DenyAll);

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(RequirePermissionAttribute.PolicyPrefix, StringComparison.Ordinal))
        {
            var permission = policyName[RequirePermissionAttribute.PolicyPrefix.Length..];
            if (PermissionCatalog.IsKnown(permission))
            {
                return Task.FromResult<AuthorizationPolicy?>(new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .AddRequirements(new PermissionRequirement(permission))
                    .Build());
            }
        }

        return Task.FromResult<AuthorizationPolicy?>(DenyAll);
    }
}

/// <summary>
/// Milestone 1 has no sign-in (Section 10, out of scope). This scheme authenticates nobody, so
/// any token a caller sends is ignored and every protected request is challenged with 401. Phase 2
/// replaces it with Cognito JWT validation.
/// </summary>
public sealed class NoSignInAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Kindred.NoSignIn";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync() => Task.FromResult(AuthenticateResult.NoResult());

    protected override Task HandleChallengeAsync(AuthenticationProperties properties) =>
        ProblemResponses.WriteAsync(Context, StatusCodes.Status401Unauthorized);

    protected override Task HandleForbiddenAsync(AuthenticationProperties properties) =>
        ProblemResponses.WriteAsync(Context, StatusCodes.Status403Forbidden);
}

public static class AuthorizationSetup
{
    public static IServiceCollection AddKindredDefaultDeny(this IServiceCollection services)
    {
        services.AddAuthentication(NoSignInAuthenticationHandler.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, NoSignInAuthenticationHandler>(NoSignInAuthenticationHandler.SchemeName, null);
        services.AddAuthorization();
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        return services;
    }
}
