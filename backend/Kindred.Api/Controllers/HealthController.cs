using Kindred.Api.Authorization;
using Kindred.Api.Contracts;
using Kindred.Application.Health;
using Microsoft.AspNetCore.Mvc;

namespace Kindred.Api.Controllers;

[ApiController]
[Route("v1/health")]
[Produces("application/json")]
public sealed class HealthController(HealthService health) : ControllerBase
{
    /// <summary>Reports whether the API is running and can reach its database.</summary>
    [HttpGet(Name = "getHealth")]
    [PublicEndpoint("Readiness probe for load balancers and local checks. It returns no data.")]
    [ProducesResponseType<HealthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<HealthResponse>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<HealthResponse>> Get(CancellationToken cancellationToken)
    {
        var report = await health.CheckAsync(cancellationToken);
        Response.Headers.CacheControl = "no-store";
        var body = HealthResponse.From(report);
        return report.Status == HealthStatus.Healthy
            ? Ok(body)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, body);
    }
}
