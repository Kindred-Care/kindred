# 0021. Redacted structured logging, problem-details errors and correlation IDs

- Status: Accepted (implemented in Milestone 1)
- Date: 2026-10-17
- Source: Section 9 principle 3 (client details never in logs), Section 10 scope ("standard error
  responses, correlation identifiers, structured logging with redaction") and criterion 11; decision 100

## Decision

**Logging.** Built-in .NET logging with the JSON console formatter (UTC timestamps, scopes). No logging
library is added. Three layers keep secrets and client details out:

1. Nothing logs request headers, bodies, query strings or raw paths. Framework categories that would
   (`Microsoft.AspNetCore`, EF Core, Npgsql, `System.Net.Http`) are set to Warning. One entry per request
   records the method, the matched **route template**, the status and the duration.
2. Every provider is wrapped by `RedactingLoggerProvider`: message text and string values pass through
   `LogRedactor` (bearer and basic credentials, JWT-shaped strings, `key=value` secrets, email addresses),
   and exception **messages are withheld** (type and stack trace kept), because messages can echo input.
3. No error monitoring or analytics service receives logs in V1 (decision 100).

**Errors.** RFC 9457 problem details (`application/problem+json`) for 400, 401, 403, 404, 405, 409, 500
and 503, carrying only `type`, `title` (a fixed text per status), `status` and `correlationId`. No
exception text, stack trace, SQL, trace ID or input values.

**Correlation.** Every request gets a correlation ID: an incoming `X-Correlation-Id` is accepted only if
it is a 16 to 64 character opaque token, otherwise a new UUIDv7 is issued. It is returned in the response
header, added to every log entry's scope and included in every problem body.

## Leaks found by the tests and fixed (2026-10-17)

The first runs against Docker found two routes the original design missed. Both are now closed and
covered by tests:

1. **Logging scopes.** ASP.NET Core attaches its own scope to every request containing the raw
   `RequestPath`, so a client name in a URL path reached the console. Scopes reach providers through a
   shared scope provider rather than `ILogger.BeginScope`, so the wrapper now hands every provider a
   `RedactingScopeProvider`: `RequestPath`, `Path`, `QueryString` and `Query` are withheld, every other
   string value is redacted, and the scope's text form is rebuilt from the sanitized values. Caught by
   `LogRedactionTests` (criterion 11).
2. **Exception text inside messages.** Some message templates, EF Core's query-failure message among
   them, embed the whole exception (`{error}`) in the message text, and database drivers copy server
   error fields such as `Detail` into `Exception.Data`. PostgreSQL's `Detail` can quote row values (for
   example a unique-key violation). The wrapper now withholds the message of the exception and every
   inner exception, and every string in `Exception.Data`, wherever they appear in the message or values.
   Found by stopping the database under the running API; unit tests
   `REQ_PLAT_006_exception_text_embedded_in_a_message_is_withheld` and
   `REQ_PLAT_006_driver_error_fields_in_exception_data_are_withheld`.

The compose connection strings also set `GSS Encryption Mode=Disable`, which stops Npgsql probing for a
Kerberos library the slim container does not include. Local PostgreSQL does not use Kerberos.

## Evidence

`LogRedactionTests` (criterion 11) sends a fake bearer token, the same token as a cookie, and a fake
client name in a header, query string, path segment and JSON body to health, an undeclared endpoint, an
unknown route and an endpoint that throws with the name in its exception message. Neither value appears
in the captured logs, and the captured file is kept as a CI artifact.
