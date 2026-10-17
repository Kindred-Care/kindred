using System.Collections.Concurrent;
using Kindred.Api.Authorization;
using Kindred.Api.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Kindred.IntegrationTests.Support;

/// <summary>
/// Hosts the real API in memory against a given connection string. Logs are captured through the
/// same <see cref="RedactingLoggerProvider"/> that wraps the console, so tests see exactly what the
/// API writes.
/// </summary>
public sealed class KindredApiFactory(string connectionString, bool includeProbeControllers = false)
    : WebApplicationFactory<Program>
{
    public CapturedLogs Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Kindred", connectionString);
        builder.ConfigureLogging(logging => logging.AddProvider(new RedactingLoggerProvider(Logs)));
        if (includeProbeControllers)
        {
            builder.ConfigureServices(services => services.AddControllers()
                .ConfigureApplicationPartManager(m => m.ApplicationParts.Add(new AssemblyPart(typeof(ProbeController).Assembly))));
        }
    }
}

/// <summary>
/// Test-only endpoints that are never part of the API. They exist to prove that an endpoint with
/// no declared permission is denied and that unhandled errors leak nothing.
/// </summary>
[ApiController]
[Route("v1/test-probes")]
public sealed class ProbeController : ControllerBase
{
    [HttpGet("undeclared")]
    public IActionResult Undeclared() => Ok("this must never be reachable");

    [HttpPost("undeclared")]
    public IActionResult UndeclaredPost([FromBody] object body) => Ok(body);

    [HttpGet("throws")]
    [PublicEndpoint("Test-only: proves unhandled errors return a generic problem response.")]
    public IActionResult Throws([FromQuery] string? name) =>
        throw new InvalidOperationException($"Simulated failure while loading client {name}");
}

public sealed class CapturedLogs : ILoggerProvider, ISupportExternalScope
{
    private readonly ConcurrentQueue<string> _entries = new();
    private IExternalScopeProvider _scopes = new LoggerExternalScopeProvider();

    public IReadOnlyCollection<string> Entries => _entries;

    public string AllText => string.Join(Environment.NewLine, _entries);

    public ILogger CreateLogger(string categoryName) => new Logger(categoryName, this);

    public void SetScopeProvider(IExternalScopeProvider scopeProvider) => _scopes = scopeProvider;

    public void Dispose()
    {
    }

    private sealed class Logger(string category, CapturedLogs owner) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => owner._scopes.Push(state);

        public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            var parts = new List<string> { $"[{logLevel}] {category}: {formatter(state, exception)}" };
            if (state is IEnumerable<KeyValuePair<string, object?>> values)
            {
                parts.AddRange(values.Select(v => $"{v.Key}={v.Value}"));
            }

            owner._scopes.ForEachScope((scope, list) => list.Add($"scope={FormatScope(scope)}"), parts);
            if (exception is not null)
            {
                parts.Add(exception.ToString());
            }

            owner._entries.Enqueue(string.Join(" | ", parts));
        }

        private static string FormatScope(object? scope) => scope is IEnumerable<KeyValuePair<string, object>> pairs
            ? string.Join(",", pairs.Select(p => $"{p.Key}={p.Value}"))
            : scope?.ToString() ?? string.Empty;
    }
}
