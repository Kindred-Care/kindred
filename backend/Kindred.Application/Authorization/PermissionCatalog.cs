namespace Kindred.Application.Authorization;

/// <summary>
/// The fixed permission catalog (Section 6). Permissions live in code and are seeded to the
/// database. Milestone 1 installs only the default-deny policy, so the catalog is intentionally
/// empty: the Section 6 permissions arrive with the access evaluator in Phase 2 (backlog B3, B4).
/// An endpoint naming a permission that is not in this catalog is denied and fails the
/// architecture tests.
/// </summary>
public static class PermissionCatalog
{
    private static readonly HashSet<string> _permissions = new(StringComparer.Ordinal);

    public static IReadOnlySet<string> All => _permissions;

    public static bool IsKnown(string permission) => _permissions.Contains(permission);
}
