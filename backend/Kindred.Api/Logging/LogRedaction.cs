using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging.Console;

namespace Kindred.Api.Logging;

/// <summary>
/// Last line of defence for logs (Section 9: client details and credentials never appear in logs).
/// The first line is not logging request headers, bodies or query strings at all; this redactor
/// scrubs credential-shaped text that reaches a log message or value by any other route.
/// </summary>
public static partial class LogRedactor
{
    public const string Redacted = "[REDACTED]";

    [GeneratedRegex(@"(?i)\b(bearer|basic)\s+[A-Za-z0-9\-._~+/]+=*", RegexOptions.CultureInvariant)]
    private static partial Regex AuthorizationValue();

    [GeneratedRegex(@"\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]*", RegexOptions.CultureInvariant)]
    private static partial Regex JsonWebToken();

    [GeneratedRegex(@"(?i)\b(password|pwd|secret|token|api[_-]?key|access[_-]?key)\s*[=:]\s*[^\s;,&]+", RegexOptions.CultureInvariant)]
    private static partial Regex KeyValueSecret();

    [GeneratedRegex(@"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", RegexOptions.CultureInvariant)]
    private static partial Regex EmailAddress();

    public static string Redact(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value ?? string.Empty;
        }

        var result = AuthorizationValue().Replace(value, m => $"{m.Groups[1].Value} {Redacted}");
        result = JsonWebToken().Replace(result, Redacted);
        result = KeyValueSecret().Replace(result, m => $"{m.Groups[1].Value}={Redacted}");
        result = EmailAddress().Replace(result, Redacted);
        return result;
    }
}

/// <summary>
/// An exception stand-in that keeps the type and stack trace for diagnosis but withholds the
/// message, which can echo input values.
/// </summary>
public sealed class WithheldMessageException(Exception original)
    : Exception($"{original.GetType().FullName}: [message withheld]", original.InnerException is null ? null : new WithheldMessageException(original.InnerException))
{
    public override string? StackTrace { get; } = original.StackTrace;
}

/// <summary>Wraps a logger provider so every entry passes through <see cref="LogRedactor"/>.</summary>
public sealed class RedactingLoggerProvider(ILoggerProvider inner) : ILoggerProvider, ISupportExternalScope
{
    public ILogger CreateLogger(string categoryName) => new RedactingLogger(inner.CreateLogger(categoryName));

    public void SetScopeProvider(IExternalScopeProvider scopeProvider)
    {
        if (inner is ISupportExternalScope scoped)
        {
            scoped.SetScopeProvider(scopeProvider);
        }
    }

    public void Dispose() => inner.Dispose();

    private sealed class RedactingLogger(ILogger inner) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => inner.BeginScope(state);

        public bool IsEnabled(LogLevel logLevel) => inner.IsEnabled(logLevel);

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!inner.IsEnabled(logLevel))
            {
                return;
            }

            var values = new List<KeyValuePair<string, object?>>();
            if (state is IEnumerable<KeyValuePair<string, object?>> pairs)
            {
                foreach (var (key, value) in pairs)
                {
                    values.Add(new(key, value is string s ? LogRedactor.Redact(s) : value));
                }
            }

            var message = LogRedactor.Redact(formatter(state, exception));
            var safeException = exception is null ? null : new WithheldMessageException(exception);
            inner.Log(logLevel, eventId, new RedactedState(message, values), safeException, static (s, _) => s.Message);
        }
    }

    private sealed class RedactedState(string message, List<KeyValuePair<string, object?>> values)
        : IReadOnlyList<KeyValuePair<string, object?>>
    {
        public string Message { get; } = message;

        public int Count => values.Count;

        public KeyValuePair<string, object?> this[int index] => values[index];

        public IEnumerator<KeyValuePair<string, object?>> GetEnumerator() => values.GetEnumerator();

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();

        public override string ToString() => Message;
    }
}

public static class LoggingSetup
{
    /// <summary>Structured JSON console logs, wrapped by the redacting provider.</summary>
    public static ILoggingBuilder AddKindredLogging(this ILoggingBuilder logging)
    {
        logging.ClearProviders();
        logging.AddJsonConsole(options =>
        {
            options.IncludeScopes = true;
            options.UseUtcTimestamp = true;
            options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ ";
        });

        var services = logging.Services;
        var console = services.Single(d => d.ServiceType == typeof(ILoggerProvider) && d.ImplementationType == typeof(ConsoleLoggerProvider));
        services.Remove(console);
        services.AddSingleton<ConsoleLoggerProvider>();
        services.AddSingleton<ILoggerProvider>(sp => new RedactingLoggerProvider(sp.GetRequiredService<ConsoleLoggerProvider>()));
        return logging;
    }
}
