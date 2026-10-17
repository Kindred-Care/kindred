using System.Text.Json;
using System.Text.Json.Serialization;
using Kindred.Api.Authorization;
using Kindred.Api.Errors;
using Kindred.Api.Logging;
using Kindred.Api.Middleware;
using Kindred.Application;
using Kindred.Infrastructure;
using Kindred.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddKindredLogging();

// The build-time OpenAPI generator starts the app without any environment configuration.
var generatingOpenApiDocument = AppDomain.CurrentDomain.GetAssemblies().Any(a => a.GetName().Name == "GetDocument.Insider");
if (!generatingOpenApiDocument && string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString(DatabaseOptions.ApplicationConnectionName)))
{
    throw new InvalidOperationException(
        $"ConnectionStrings__{DatabaseOptions.ApplicationConnectionName} is not set. Copy .env.example to .env (see README).");
}

// Enums travel as camelCase strings. MVC serializes responses; the OpenAPI generator reads the
// HTTP options, so both are set to keep the contract and the wire format identical.
var enumsAsStrings = new JsonStringEnumConverter(JsonNamingPolicy.CamelCase);
builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(enumsAsStrings));
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.Converters.Add(enumsAsStrings));
builder.Services.AddOpenApi("v1", options => options.AddDocumentTransformer((document, _, _) =>
{
    document.Info.Title = "Kindred API";
    document.Info.Version = "v1";
    document.Info.Description = "Kindred API. Generated at build time; do not edit by hand.";
    document.Servers?.Clear();
    return Task.CompletedTask;
}));
builder.Services.AddKindredProblemDetails();
builder.Services.AddKindredDefaultDeny();
builder.Services.AddKindredApplication();
builder.Services.AddKindredInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseCorrelationId();
app.UseKindredRequestLogging();
app.UseKindredExceptionHandler();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// The OpenAPI document is produced at build time and committed (docs/api/openapi.json). It is not
// served at runtime, so health stays the only public endpoint.

app.Run();

/// <summary>Entry point, public for the integration and architecture test hosts.</summary>
public partial class Program;
