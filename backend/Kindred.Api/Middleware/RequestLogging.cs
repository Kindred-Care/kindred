using System.Diagnostics;

namespace Kindred.Api.Middleware;

/// <summary>
/// One structured log entry per request with the method, the matched route template (never the raw
/// path or query string), the status code and the duration. Headers and bodies are never logged,
/// so tokens and client details cannot reach the logs this way (Section 9, principle 3).
/// </summary>
public static partial class RequestLogging
{
    public static IApplicationBuilder UseKindredRequestLogging(this IApplicationBuilder app) =>
        app.Use(async (context, next) =>
        {
            var started = Stopwatch.GetTimestamp();
            try
            {
                await next(context);
            }
            finally
            {
                var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Kindred.Api.Request");
                var route = (context.GetEndpoint() as RouteEndpoint)?.RoutePattern.RawText ?? "(unmatched)";
                LogCompleted(logger, context.Request.Method, route, context.Response.StatusCode, Stopwatch.GetElapsedTime(started).TotalMilliseconds);
            }
        });

    [LoggerMessage(EventId = 1000, Level = LogLevel.Information, Message = "HTTP {Method} {Route} responded {StatusCode} in {ElapsedMs:0.0} ms")]
    private static partial void LogCompleted(ILogger logger, string method, string route, int statusCode, double elapsedMs);
}
