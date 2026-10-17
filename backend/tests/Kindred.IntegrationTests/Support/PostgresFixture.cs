using Kindred.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;

namespace Kindred.IntegrationTests.Support;

/// <summary>
/// A real PostgreSQL 18 container bootstrapped with the same role script as docker compose
/// (scripts/dev/db/init/01-roles.sh), then migrated with the migration role. Tests connect as the
/// application role, exactly as the API does.
/// </summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    public const string Image = "postgres:18.6";
    private const string Database = "kindred";
    private const string MigratorPassword = "local-dev-only-migrator";
    private const string AppPassword = "local-dev-only-app";

    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder(Image)
        .WithDatabase(Database)
        .WithUsername("kindred_bootstrap")
        .WithPassword("local-dev-only-bootstrap")
        .WithEnvironment("KINDRED_DB_MIGRATOR_PASSWORD", MigratorPassword)
        .WithEnvironment("KINDRED_DB_APP_PASSWORD", AppPassword)
        .WithResourceMapping(new FileInfo(RepositoryPaths.RoleBootstrapScript), "/docker-entrypoint-initdb.d/")
        .Build();

    public string SuperuserConnectionString => _container.GetConnectionString();

    public string MigratorConnectionString => ConnectionFor("kindred_migrator", MigratorPassword);

    public string AppConnectionString => ConnectionFor("kindred_app", AppPassword);

    public async ValueTask InitializeAsync()
    {
        await _container.StartAsync();

        var options = new DbContextOptionsBuilder<KindredDbContext>();
        DatabaseOptions.Configure(options, MigratorConnectionString);
        await using var context = new KindredDbContext(options.Options);
        await context.Database.MigrateAsync();
    }

    public async ValueTask DisposeAsync() => await _container.DisposeAsync();

    private string ConnectionFor(string user, string password) =>
        new NpgsqlConnectionStringBuilder(SuperuserConnectionString)
        {
            Username = user,
            Password = password,
            Pooling = false,
        }.ConnectionString;
}

[CollectionDefinition(Name)]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture>
{
    public const string Name = "postgres";
}

internal static class RepositoryPaths
{
    public static string Root { get; } = FindRoot();

    public static string RoleBootstrapScript => Path.Combine(Root, "scripts", "dev", "db", "init", "01-roles.sh");

    public static string Artifacts => Directory.CreateDirectory(Path.Combine(Root, "artifacts")).FullName;

    private static string FindRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "global.json")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Repository root (global.json) not found.");
    }
}
