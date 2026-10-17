using System.Text.Json;
using Kindred.Infrastructure.Persistence;
using Kindred.IntegrationTests.Support;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Kindred.IntegrationTests.Database;

/// <summary>Criterion 13: baseline migration, separate roles, version and extension availability.</summary>
[Collection(PostgresCollection.Name)]
public sealed class DatabaseBaselineTests(PostgresFixture database)
{
    [Fact]
    public async Task REQ_DATA_005_the_baseline_applies_to_an_empty_database()
    {
        // A brand-new database with nothing in it, prepared exactly like the bootstrap script does.
        var name = "empty_" + Guid.CreateVersion7().ToString("N")[..12];
        await ExecuteAsync(database.SuperuserConnectionString,
            $"CREATE DATABASE {name}",
            $"REVOKE ALL ON DATABASE {name} FROM PUBLIC",
            $"GRANT CONNECT, CREATE ON DATABASE {name} TO kindred_migrator");
        await ExecuteAsync(WithDatabase(database.SuperuserConnectionString, name), "REVOKE ALL ON SCHEMA public FROM PUBLIC");

        var options = new DbContextOptionsBuilder<KindredDbContext>();
        DatabaseOptions.Configure(options, WithDatabase(database.MigratorConnectionString, name));
        await using var context = new KindredDbContext(options.Options);
        Assert.Empty(await context.Database.GetAppliedMigrationsAsync(TestContext.Current.CancellationToken));

        await context.Database.MigrateAsync(TestContext.Current.CancellationToken);

        Assert.Equal(context.Database.GetMigrations(), await context.Database.GetAppliedMigrationsAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await context.Database.GetPendingMigrationsAsync(TestContext.Current.CancellationToken));
        var installed = await QueryAsync(WithDatabase(database.SuperuserConnectionString, name),
            "SELECT extname FROM pg_extension WHERE extname IN ('btree_gist','pg_trgm') ORDER BY extname");
        Assert.Equal(["btree_gist", "pg_trgm"], installed);
    }

    [Theory]
    [InlineData("CREATE TABLE kindred.app_created (id uuid PRIMARY KEY)")]
    [InlineData("CREATE TABLE public.app_created (id uuid PRIMARY KEY)")]
    [InlineData("CREATE SCHEMA app_schema")]
    [InlineData("ALTER TABLE kindred.__ef_migrations_history ADD COLUMN injected text")]
    [InlineData("DROP TABLE kindred.__ef_migrations_history")]
    [InlineData("TRUNCATE kindred.__ef_migrations_history")]
    [InlineData("DELETE FROM kindred.__ef_migrations_history")]
    [InlineData("CREATE EXTENSION IF NOT EXISTS hstore")]
    [InlineData("CREATE ROLE intruder LOGIN")]
    public async Task REQ_DATA_006_the_application_role_cannot_change_the_schema(string statement)
    {
        var error = await Assert.ThrowsAsync<PostgresException>(() => ExecuteAsync(database.AppConnectionString, statement));

        Assert.Equal(PostgresErrorCodes.InsufficientPrivilege, error.SqlState);
    }

    [Fact]
    public async Task REQ_DATA_006_the_application_role_has_no_elevated_attributes()
    {
        var row = await QueryAsync(database.AppConnectionString,
            "SELECT concat_ws(',', rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolreplication) FROM pg_roles WHERE rolname = current_user");

        // PostgreSQL renders booleans as t/f.
        Assert.Equal(["f,f,f,f,f"], row);
    }

    [Fact]
    public async Task REQ_DATA_006_the_application_role_can_still_connect_and_query()
    {
        Assert.Equal(["1"], await QueryAsync(database.AppConnectionString, "SELECT 1"));
    }

    [Fact]
    public async Task REQ_DATA_007_postgresql_version_and_extension_availability_are_recorded()
    {
        var version = (await QueryAsync(database.AppConnectionString, "SHOW server_version")).Single();
        var available = await QueryAsync(database.AppConnectionString,
            "SELECT name || ' ' || default_version FROM pg_available_extensions WHERE name IN ('btree_gist','pg_trgm') ORDER BY name");

        Assert.StartsWith("18.", version, StringComparison.Ordinal);
        Assert.Equal(2, available.Count);

        var record = new
        {
            image = PostgresFixture.Image,
            serverVersion = version,
            extensionsAvailable = available,
            recordedAtUtc = DateTimeOffset.UtcNow,
        };
        await File.WriteAllTextAsync(
            Path.Combine(RepositoryPaths.Artifacts, "criterion-13-postgres.json"),
            JsonSerializer.Serialize(record, new JsonSerializerOptions { WriteIndented = true }),
            TestContext.Current.CancellationToken);
        TestContext.Current.SendDiagnosticMessage($"PostgreSQL {version}; available: {string.Join(", ", available)}");
    }

    private static string WithDatabase(string connectionString, string databaseName) =>
        new NpgsqlConnectionStringBuilder(connectionString) { Database = databaseName }.ConnectionString;

    private static async Task ExecuteAsync(string connectionString, params string[] statements)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        foreach (var statement in statements)
        {
            await using var command = new NpgsqlCommand(statement, connection);
            await command.ExecuteNonQueryAsync();
        }
    }

    private static async Task<List<string>> QueryAsync(string connectionString, string sql)
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<string>();
        while (await reader.ReadAsync())
        {
            rows.Add(Convert.ToString(reader.GetValue(0), System.Globalization.CultureInfo.InvariantCulture)!);
        }

        return rows;
    }
}
