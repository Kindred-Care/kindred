using System.Reflection;
using Kindred.Api.Controllers;
using Kindred.Application.Health;
using Kindred.Domain.Common;
using Kindred.Infrastructure.Persistence;
using NetArchTest.Rules;

namespace Kindred.ArchitectureTests;

/// <summary>Dependency rules between the backend projects (Section 3, Refinement 3).</summary>
public sealed class LayeringTests
{
    private static readonly Assembly _domain = typeof(Entity).Assembly;
    private static readonly Assembly _application = typeof(HealthService).Assembly;
    private static readonly Assembly _infrastructure = typeof(KindredDbContext).Assembly;
    private static readonly Assembly _api = typeof(HealthController).Assembly;

    private static readonly string[] _persistenceAndCloud =
        ["Microsoft.EntityFrameworkCore", "Npgsql", "Amazon", "AWSSDK"];

    private static IEnumerable<string> ReferencedAssemblyNames(Assembly assembly) =>
        assembly.GetReferencedAssemblies().Select(a => a.Name!);

    [Fact]
    public void REQ_PLAT_011_domain_references_no_other_layer_persistence_or_cloud_code()
    {
        var forbidden = ReferencedAssemblyNames(_domain)
            .Where(n => n.StartsWith("Kindred.", StringComparison.Ordinal)
                || _persistenceAndCloud.Any(f => n.StartsWith(f, StringComparison.Ordinal)))
            .ToList();
        Assert.Empty(forbidden);

        var result = Types.InAssembly(_domain).ShouldNot()
            .HaveDependencyOnAny([.. _persistenceAndCloud, "Kindred.Application", "Kindred.Infrastructure", "Kindred.Api"])
            .GetResult();
        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void REQ_PLAT_011_application_does_not_reference_infrastructure_api_or_persistence()
    {
        var forbidden = ReferencedAssemblyNames(_application)
            .Where(n => n is "Kindred.Infrastructure" or "Kindred.Api"
                || _persistenceAndCloud.Any(f => n.StartsWith(f, StringComparison.Ordinal)))
            .ToList();
        Assert.Empty(forbidden);

        var result = Types.InAssembly(_application).ShouldNot()
            .HaveDependencyOnAny([.. _persistenceAndCloud, "Kindred.Infrastructure", "Kindred.Api"])
            .GetResult();
        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void REQ_PLAT_011_infrastructure_does_not_reference_api()
    {
        Assert.DoesNotContain("Kindred.Api", ReferencedAssemblyNames(_infrastructure));
        var result = Types.InAssembly(_infrastructure).ShouldNot().HaveDependencyOn("Kindred.Api").GetResult();
        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void REQ_PLAT_012_controllers_do_not_use_the_database_context()
    {
        var result = Types.InAssembly(_api)
            .That().ResideInNamespace("Kindred.Api.Controllers")
            .ShouldNot().HaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Kindred.Infrastructure", "Npgsql")
            .GetResult();
        Assert.True(result.IsSuccessful, Describe(result));
    }

    private static string Describe(NetArchTest.Rules.TestResult result) =>
        "Violations: " + string.Join(", ", result.FailingTypeNames ?? []);
}
