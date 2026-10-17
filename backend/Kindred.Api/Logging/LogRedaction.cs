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
        // Scopes reach providers through this shared provider, not through ILogger.BeginScope, so they
        // are sanitized here. ASP.NET Core's own request scope carries the raw request path, which can
        // contain client details.
        if (inner is ISupportExternalScope scoped)
        {
            scoped.SetScopeProvider(new RedactingScopeProvider(scopeProvider));
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
                    values.Add(new(key, value switch
                    {
                        string s => WithholdExceptionText(LogRedactor.Redact(s), exception),
                        Exception e => new WithheldMessageException(e).ToString(),
                        _ => value,
                    }));
                }
            }

            // Some templates (EF Core's query errors among them) embed the exception text in the message
            // itself, and database errors can quote data values, so those messages are withheld here too.
            var message = WithholdExceptionText(LogRedactor.Redact(formatter(state, exception)), exception);
            var safeException = exception is null ? null : new WithheldMessageException(exception);
            inner.Log(logLevel, eventId, new RedactedState(message, values), safeException, static (s, _) => s.Message);
        }
    }

    /// <summary>Replaces the message of the exception and of every inner exception wherever it appears.</summary>
    public static string WithholdExceptionText(string text, Exception? exception)
    {
        var pending = new Stack<Exception>();
        if (exception is not null)
        {
            pending.Push(exception);
        }

        while (pending.Count > 0)
        {
            var current = pending.Pop();
            if (current.Message.Length > 0)
            {
                text = text.Replace(current.Message, "[message withheld]", StringComparison.Ordinal);
            }

            // Database drivers (Npgsql among them) copy server error fields such as MessageText and
            // Detail into Exception.Data, which ToString prints; Detail can quote row values.
            foreach (System.Collections.DictionaryEntry entry in current.Data)
            {
                if (entry.Value is string { Length: > 3 } value)
                {
                    text = text.Replace(value, "[withheld]", StringComparison.Ordinal);
                }
            }

            if (current is AggregateException aggregate)
            {
                foreach (var inner in aggregate.InnerExceptions)
                {
                    pending.Push(inner);
                }
            }
            else if (current.InnerException is not null)
            {
                pending.Push(current.InnerException);
            }
        }

        return text;
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

/// <summary>
/// Presents every logging scope in sanitized form: keys that carry raw request input (the request path
/// and query) are withheld, every other string value passes through <see cref="LogRedactor"/>, and
/// the scope's text form is rebuilt from the sanitized values.
/// </summary>
public sealed class RedactingScopeProvider(IExternalScopeProvider inner) : IExternalScopeProvider
{
    public const string Withheld = "[withheld]";

    private static readonly HashSet<string> _withheldKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "RequestPath",
        "Path",
        "QueryString",
        "Query",
    };

    public IDisposable Push(object? state) => inner.Push(state);

    public void ForEachScope<TState>(Action<object?, TState> callback, TState state) =>
        inner.ForEachScope((scope, s) => callback(Sanitize(scope), s), state);

    public static object? Sanitize(object? scope) => scope switch
    {
        null => null,
        // Matches both nullable and non-nullable value annotations (they are the same runtime type).
        IEnumerable<KeyValuePair<string, object?>> pairs => new SanitizedScope(pairs),
        string text => LogRedactor.Redact(text),
        _ => LogRedactor.Redact(scope.ToString()),
    };

    private sealed class SanitizedScope : IReadOnlyList<KeyValuePair<string, object?>>
    {
        private readonly List<KeyValuePair<string, object?>> _values;

        public SanitizedScope(IEnumerable<KeyValuePair<string, object?>> pairs) =>
            _values = pairs
                .Where(p => p.Key != "{OriginalFormat}")
                .Select(p => new KeyValuePair<string, object?>(
                    p.Key,
                    _withheldKeys.Contains(p.Key) ? Withheld : p.Value is string s ? LogRedactor.Redact(s) : p.Value))
                .ToList();

        public int Count => _values.Count;

        public KeyValuePair<string, object?> this[int index] => _values[index];

        public IEnumerator<KeyValuePair<string, object?>> GetEnumerator() => _values.GetEnumerator();

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();

        public override string ToString() => string.Join(" ", _values.Select(p => $"{p.Key}:{p.Value}"));
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
