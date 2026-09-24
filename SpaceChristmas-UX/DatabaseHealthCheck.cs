using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using SpaceChristmas.Models;

public class DatabaseHealthCheck(EventContext context) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext healthContext, CancellationToken cancellationToken = default)
    {
        if (!await context.Database.CanConnectAsync(cancellationToken))
            return HealthCheckResult.Unhealthy("Database is unavailable.");
        if ((await context.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
            return HealthCheckResult.Unhealthy("Database migrations are pending.");
        return HealthCheckResult.Healthy();
    }
}
