using Microsoft.EntityFrameworkCore;

namespace Kindred.Infrastructure.Persistence;

/// <summary>
/// The single EF Core context. Milestone 1 maps no feature tables; the baseline migration sets up
/// the schema and the extensions later phases rely on.
/// </summary>
public sealed class KindredDbContext(DbContextOptions<KindredDbContext> options) : DbContext(options)
{
    public const string Schema = "kindred";
    public const string MigrationsHistoryTable = "__ef_migrations_history";

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(KindredDbContext).Assembly);
        ModelConventions.Apply(modelBuilder);
    }
}
