using Kindred.Domain.Common;
using Kindred.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Kindred.UnitTests.Infrastructure;

public sealed class ModelConventionTests
{
    private sealed class Parent : Entity
    {
        public string Name { get; set; } = string.Empty;

        public DateTimeOffset CreatedAt { get; set; }
    }

    private sealed class Child : Entity
    {
        public Guid ParentId { get; set; }

        public Parent? Parent { get; set; }
    }

    private sealed class History : Entity, IAppendOnly
    {
        public string Change { get; set; } = string.Empty;
    }

    private sealed class WithDateTime : Entity
    {
        public DateTime LocalTime { get; set; }
    }

    private sealed class ConventionContext(Action<ModelBuilder> addEntities) : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            DatabaseOptions.Configure(optionsBuilder, "Host=unused;Database=unused");
            // Each test builds its own model instead of reusing one cached per context type.
            optionsBuilder.EnableServiceProviderCaching(false);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema(KindredDbContext.Schema);
            addEntities(modelBuilder);
            ModelConventions.Apply(modelBuilder);
        }
    }

    private static IModel BuildModel()
    {
        using var context = new ConventionContext(b =>
        {
            b.Entity<Parent>();
            b.Entity<Child>();
            b.Entity<History>();
        });
        return context.Model;
    }

    [Fact]
    public void REQ_DATA_001_keys_are_application_generated()
    {
        var key = BuildModel().FindEntityType(typeof(Parent))!.FindPrimaryKey()!;

        Assert.Equal(nameof(Entity.Id), Assert.Single(key.Properties).Name);
        Assert.Equal(Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.Never, key.Properties[0].ValueGenerated);
    }

    [Fact]
    public void REQ_DATA_002_mutable_entities_use_xmin_as_concurrency_token()
    {
        var token = BuildModel().FindEntityType(typeof(Parent))!.FindProperty(ModelConventions.ConcurrencyTokenProperty);

        Assert.NotNull(token);
        Assert.True(token.IsConcurrencyToken);
        Assert.Equal("xid", token.GetColumnType());
    }

    [Fact]
    public void REQ_DATA_002_append_only_entities_have_no_concurrency_token()
    {
        var history = BuildModel().FindEntityType(typeof(History))!;

        Assert.Null(history.FindProperty(ModelConventions.ConcurrencyTokenProperty));
    }

    [Fact]
    public void REQ_DATA_004_relationships_never_cascade()
    {
        var foreignKey = Assert.Single(BuildModel().FindEntityType(typeof(Child))!.GetForeignKeys());

        Assert.Equal(DeleteBehavior.Restrict, foreignKey.DeleteBehavior);
    }

    [Fact]
    public void REQ_DATA_003_instants_are_utc_timestamptz_and_names_are_snake_case()
    {
        var parent = BuildModel().FindEntityType(typeof(Parent))!;

        Assert.Equal("kindred", parent.GetSchema());
        Assert.Equal("parent", parent.GetTableName());
        Assert.Equal("created_at", parent.FindProperty(nameof(Parent.CreatedAt))!.GetColumnName());
        Assert.Equal("timestamp with time zone", parent.FindProperty(nameof(Parent.CreatedAt))!.GetColumnType());
    }

    [Fact]
    public void REQ_DATA_003_datetime_properties_are_rejected()
    {
        using var context = new ConventionContext(b => b.Entity<WithDateTime>());

        var error = Assert.Throws<InvalidOperationException>(() => context.Model);
        Assert.Contains("DateTimeOffset", error.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void REQ_DATA_008_the_production_model_has_the_kindred_schema()
    {
        var options = new DbContextOptionsBuilder<KindredDbContext>();
        DatabaseOptions.Configure(options, "Host=unused;Database=unused");
        using var context = new KindredDbContext(options.Options);

        Assert.Equal(KindredDbContext.Schema, context.Model.GetDefaultSchema());
    }
}
