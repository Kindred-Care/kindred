using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kindred.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Milestone 1 baseline (Section 10, criterion 13). Creates the application schema and the
    /// PostgreSQL extensions later phases depend on: btree_gist for the assignment exclusion
    /// constraint and pg_trgm for name search. Both are trusted extensions, so the migration role
    /// can install them without superuser rights. Feature tables arrive in Phase 2 and later.
    /// </summary>
    public partial class Baseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(name: "kindred");
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA kindred;");
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA kindred;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP EXTENSION IF EXISTS pg_trgm;");
            migrationBuilder.Sql("DROP EXTENSION IF EXISTS btree_gist;");
        }
    }
}
