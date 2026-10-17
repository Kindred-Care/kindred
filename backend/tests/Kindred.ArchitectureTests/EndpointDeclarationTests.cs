using System.Reflection;
using Kindred.Api.Authorization;
using Kindred.Api.Controllers;
using Kindred.Application.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Kindred.ArchitectureTests;

/// <summary>
/// Section 6a: every endpoint declares its required permission and the build fails if one is
/// missing. Health is the only public endpoint in Milestone 1 (criterion 10).
/// </summary>
[Trait("Category", "Security")]
public sealed class EndpointDeclarationTests
{
    /// <summary>The complete list of endpoints allowed without a signed-in user.</summary>
    private static readonly HashSet<string> _publicEndpointAllowlist = ["GET v1/health"];

    private static readonly Assembly _api = typeof(HealthController).Assembly;

    private static IEnumerable<MethodInfo> ControllerActions() =>
        _api.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .SelectMany(t => t.GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly))
            .Where(m => !m.IsSpecialName && m.GetCustomAttribute<NonActionAttribute>() is null);

    [Fact]
    public void REQ_SEC_002_every_action_declares_a_permission_or_is_explicitly_public()
    {
        var undeclared = ControllerActions()
            .Where(m => m.GetCustomAttribute<PublicEndpointAttribute>() is null
                && m.GetCustomAttribute<RequirePermissionAttribute>() is null
                && m.DeclaringType!.GetCustomAttribute<RequirePermissionAttribute>() is null)
            .Select(m => $"{m.DeclaringType!.Name}.{m.Name}")
            .ToList();

        Assert.Empty(undeclared);
    }

    [Fact]
    public void REQ_SEC_002_allow_anonymous_is_never_used_directly()
    {
        var raw = ControllerActions()
            .SelectMany(m => new ICustomAttributeProvider[] { m, m.DeclaringType! })
            .Where(p => p.GetCustomAttributes(typeof(AllowAnonymousAttribute), false).Length > 0)
            .ToList();

        Assert.Empty(raw);
    }

    [Fact]
    public void REQ_SEC_002_declared_permissions_exist_in_the_catalog()
    {
        var unknown = ControllerActions()
            .SelectMany(m => new[] { m.GetCustomAttribute<RequirePermissionAttribute>(), m.DeclaringType!.GetCustomAttribute<RequirePermissionAttribute>() })
            .OfType<RequirePermissionAttribute>()
            .Select(a => a.Permission)
            .Where(p => !PermissionCatalog.IsKnown(p))
            .ToList();

        Assert.Empty(unknown);
    }

    [Fact]
    public void REQ_PLAT_003_every_route_is_versioned()
    {
        var unversioned = ControllerActions()
            .Select(m => m.DeclaringType!.GetCustomAttribute<RouteAttribute>()?.Template ?? string.Empty)
            .Where(t => !t.StartsWith("v1/", StringComparison.Ordinal))
            .ToList();

        Assert.Empty(unversioned);
    }

    [Fact]
    public void REQ_SEC_002_the_running_app_exposes_health_as_its_only_public_endpoint()
    {
        using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseEnvironment("Testing");
            b.UseSetting("ConnectionStrings:Kindred", "Host=unused;Database=unused");
        });
        var endpoints = factory.Services.GetRequiredService<EndpointDataSource>().Endpoints.OfType<RouteEndpoint>().ToList();

        Assert.NotEmpty(endpoints);
        var publicEndpoints = new List<string>();
        foreach (var endpoint in endpoints)
        {
            var methods = endpoint.Metadata.GetMetadata<HttpMethodMetadata>()?.HttpMethods ?? ["*"];
            var name = $"{string.Join(",", methods)} {endpoint.RoutePattern.RawText}";
            var isPublic = endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null;
            var declaresPermission = endpoint.Metadata.GetOrderedMetadata<IAuthorizeData>().OfType<RequirePermissionAttribute>().Any();

            Assert.True(isPublic || declaresPermission, $"{name} declares neither a permission nor public access.");
            if (isPublic)
            {
                Assert.IsType<PublicEndpointAttribute>(endpoint.Metadata.GetMetadata<IAllowAnonymous>());
                publicEndpoints.Add(name);
            }
        }

        Assert.Equal(_publicEndpointAllowlist.Order(), publicEndpoints.Order());
    }
}
