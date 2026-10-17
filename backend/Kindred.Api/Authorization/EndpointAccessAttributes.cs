using Microsoft.AspNetCore.Authorization;

namespace Kindred.Api.Authorization;

/// <summary>
/// Declares the Section 6 permission an endpoint requires. Every endpoint must carry this or
/// <see cref="PublicEndpointAttribute"/>; anything else is denied by the fallback policy and fails
/// the architecture tests (Section 6a, default deny).
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
public sealed class RequirePermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "permission:";

    public RequirePermissionAttribute(string permission)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(permission);
        Permission = permission;
        Policy = PolicyPrefix + permission;
    }

    public string Permission { get; }
}

/// <summary>
/// Marks an endpoint that needs no signed-in user. Health is the only one in Milestone 1; the
/// sign-in flow and consent-link routes are the only others Section 6a allows. A written reason
/// is mandatory, and the architecture tests keep an explicit allowlist.
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class PublicEndpointAttribute(string reason) : Attribute, IAllowAnonymous
{
    public string Reason { get; } = string.IsNullOrWhiteSpace(reason)
        ? throw new ArgumentException("A public endpoint must state why it is public.", nameof(reason))
        : reason;
}
