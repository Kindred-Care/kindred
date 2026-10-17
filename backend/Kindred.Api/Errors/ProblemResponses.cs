using Kindred.Api.Middleware;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Kindred.Api.Errors;

/// <summary>
/// Standard error responses: RFC 9457 problem details with a fixed title per status and the
/// request's correlation ID. Bodies never carry exception messages, stack traces, SQL or input
/// values.
/// </summary>
public static class ProblemResponses
{
    public const string CorrelationIdExtension = "correlationId";

    public static IServiceCollection AddKindredProblemDetails(this IServiceCollection services) =>
        services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
        {
            var problem = context.ProblemDetails;
            problem.Detail = null;
            problem.Instance = null;
            problem.Extensions.Remove("exception");
            problem.Extensions.Remove("traceId");
            problem.Extensions.Remove("errors");
            problem.Title = TitleFor(problem.Status ?? context.HttpContext.Response.StatusCode);
            problem.Extensions[CorrelationIdExtension] = CorrelationId.Get(context.HttpContext);
        });

    public static async Task WriteAsync(HttpContext context, int statusCode)
    {
        context.Response.StatusCode = statusCode;
        var writer = context.RequestServices.GetRequiredService<IProblemDetailsService>();
        await writer.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = new ProblemDetails { Status = statusCode },
        });
    }

    /// <summary>Logs the failure without its message (which may echo input) and returns a 500.</summary>
    public static IApplicationBuilder UseKindredExceptionHandler(this IApplicationBuilder app) =>
        app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
        {
            var feature = context.Features.Get<IExceptionHandlerFeature>();
            if (feature is not null)
            {
                var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Kindred.Api.UnhandledException");
                logger.LogError(feature.Error, "Unhandled {ExceptionType}", feature.Error.GetType().FullName);
            }

            await WriteAsync(context, StatusCodes.Status500InternalServerError);
        }));

    public static string TitleFor(int status) => status switch
    {
        StatusCodes.Status400BadRequest => "The request is not valid.",
        StatusCodes.Status401Unauthorized => "Sign-in is required.",
        StatusCodes.Status403Forbidden => "You do not have access to this.",
        StatusCodes.Status404NotFound => "Not found.",
        StatusCodes.Status405MethodNotAllowed => "This method is not allowed here.",
        StatusCodes.Status409Conflict => "The record was changed by someone else.",
        StatusCodes.Status503ServiceUnavailable => "The service is temporarily unavailable.",
        _ when status >= 500 => "Something went wrong.",
        _ => "The request could not be completed.",
    };
}
