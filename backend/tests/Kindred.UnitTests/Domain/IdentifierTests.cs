using Kindred.Domain.Common;

namespace Kindred.UnitTests.Domain;

public sealed class IdentifierTests
{
    private sealed class SampleEntity : Entity
    {
        public SampleEntity()
        {
        }

        public SampleEntity(Guid id)
            : base(id)
        {
        }
    }

    [Fact]
    public void REQ_DATA_001_new_identifiers_are_uuid_version_7()
    {
        var id = Identifiers.NewId();

        Assert.Equal(7, id.Version);
        Assert.True(Identifiers.IsVersion7(id));
    }

    [Fact]
    public void REQ_DATA_001_identifiers_sort_by_creation_time()
    {
        var ids = Enumerable.Range(0, 50).Select(_ =>
        {
            Thread.Sleep(1);
            return Identifiers.NewId();
        }).ToList();

        Assert.Equal(ids.Select(i => i.ToString()).Order(StringComparer.Ordinal), ids.Select(i => i.ToString()));
    }

    [Fact]
    public void REQ_DATA_001_entities_get_a_version_7_id_and_reject_others()
    {
        Assert.True(Identifiers.IsVersion7(new SampleEntity().Id));
        Assert.Throws<ArgumentException>(() => new SampleEntity(Guid.Empty));
        Assert.Throws<ArgumentException>(() => new SampleEntity(Guid.NewGuid()));
    }
}
