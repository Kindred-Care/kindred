using Kindred.Application.Health;
using Kindred.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Kindred.Infrastructure.Health;

internal sealed class DatabaseHealthProbe(KindredDbContext db) : IDatabaseHealthProbe
{
    private static readonly TimeSpan _timeout = TimeSpan.FromSeconds(3);

    public async Task<bool> CanConnectAsync(CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(_timeout);
        try
        {
            // A real round trip with the application role, not just an open socket.
            var result = await db.Database.SqlQueryRaw<int>("SELECT 1 AS \"Value\"").SingleAsync(timeout.Token);
            return result == 1;
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return false;
        }
    }
}
