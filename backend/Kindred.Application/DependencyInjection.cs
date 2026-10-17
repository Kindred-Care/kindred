using Kindred.Application.Common;
using Kindred.Application.Health;
using Microsoft.Extensions.DependencyInjection;

namespace Kindred.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddKindredApplication(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<HealthService>();
        return services;
    }
}
