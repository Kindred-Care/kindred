using System.Text.RegularExpressions;
using Kindred.Domain.Common;

namespace Kindred.Api.Middleware;

/// <summary>
/// Gives every request a correlation ID, echoed in the <c>X-Correlation-Id</c> response header,
/// every log entry and every problem-details body. A caller-supplied ID is accepted only if it is a
/// short opaque token, so the header cannot carry data into the logs.
/// </summary>
public static partial class CorrelationId
{
    public const string HeaderName = "X-Correlation-Id";
    private const string ItemKey = "Kindred.CorrelationId";

    [GeneratedRegex("^[A-Za-z0-9-]{16,64}$", RegexOptions.CultureInvariant)]
    private static partial Regex AcceptedFormat();

    public static bool IsAcceptable(string? value) => value is not null && AcceptedFormat().IsMatch(value);

    public static string Get(HttpContext context) =>
        context.Items.TryGetValue(ItemKey, out var value) && value is string id ? id : string.Empty;

    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app) =>
        app.Use(async (context, next) =>
        {
            var incoming = context.Request.Headers[HeaderName].ToString();
            var id = IsAcceptable(incoming) ? incoming : Identifiers.NewId().ToString("N");
            context.Items[ItemKey] = id;
            context.Response.Headers[HeaderName] = id;

            var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Kindred.Api.Request");
            using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = id }))
            {
                await next(context);
            }
        });
}
