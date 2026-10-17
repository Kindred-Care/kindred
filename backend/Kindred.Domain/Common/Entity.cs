namespace Kindred.Domain.Common;

/// <summary>
/// Base for every persisted entity. Domain stays free of persistence code: the concurrency token
/// (PostgreSQL xmin) and column naming are mapped in Infrastructure.
/// </summary>
public abstract class Entity
{
    protected Entity()
        : this(Identifiers.NewId())
    {
    }

    protected Entity(Guid id)
    {
        if (!Identifiers.IsVersion7(id))
        {
            throw new ArgumentException("Entity identifiers must be UUIDv7.", nameof(id));
        }

        Id = id;
    }

    public Guid Id { get; private set; }
}

/// <summary>
/// Marks an insert-only entity (shift events, care note versions, audit events). It gets no
/// optimistic concurrency token, because duplicates are rejected by unique constraints at insert
/// (Section 4, concurrency exceptions).
/// </summary>
public interface IAppendOnly;
