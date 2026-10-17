namespace Kindred.Application.Common;

/// <summary>Source of the current time. Always UTC (Section 2, time standard).</summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
