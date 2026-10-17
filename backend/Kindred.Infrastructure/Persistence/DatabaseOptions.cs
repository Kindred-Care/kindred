using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Npgsql;

namespace Kindred.Infrastructure.Persistence;

public static class DatabaseOptions
{
    /// <summary>
    /// Connection string name for the application role. The API never receives the migration
    /// role's credentials (Section 6a: migrations use a separate role).
    /// </summary>
    public const string ApplicationConnectionName = "Kindred";

    public static void Configure(DbContextOptionsBuilder options, string connectionString) =>
        options
            .UseNpgsql(connectionString, npgsql => npgsql
                .MigrationsHistoryTable(KindredDbContext.MigrationsHistoryTable, KindredDbContext.Schema)
                .MigrationsAssembly(typeof(KindredDbContext).Assembly.FullName))
            .UseSnakeCaseNamingConvention();
}

/// <summary>
/// Used only by <c>dotnet ef</c> and the migration bundle. The migration role's connection string
/// comes from the <c>KINDRED_MIGRATOR_CONNECTION</c> environment variable or the bundle's
/// <c>--connection</c> argument, never from the API's configuration.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<KindredDbContext>
{
    public KindredDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("KINDRED_MIGRATOR_CONNECTION")
            ?? new NpgsqlConnectionStringBuilder { Host = "localhost", Database = "kindred" }.ConnectionString;

        var builder = new DbContextOptionsBuilder<KindredDbContext>();
        DatabaseOptions.Configure(builder, connectionString);
        return new KindredDbContext(builder.Options);
    }
}
