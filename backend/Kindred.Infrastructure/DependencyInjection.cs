using Kindred.Application.Health;
using Kindred.Infrastructure.Health;
using Kindred.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kindred.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddKindredInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString(DatabaseOptions.ApplicationConnectionName) ?? string.Empty;

        services.AddDbContext<KindredDbContext>(options => DatabaseOptions.Configure(options, connectionString));
        services.AddScoped<IDatabaseHealthProbe, DatabaseHealthProbe>();
        return services;
    }
}
