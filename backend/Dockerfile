# syntax=docker/dockerfile:1
# Builds the API image and the migration bundle image. Build context: the repository root.

ARG DOTNET_VERSION=10.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
WORKDIR /src
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1
COPY global.json dotnet-tools.json ./
COPY backend/Directory.Build.props backend/Directory.Packages.props backend/Kindred.slnx backend/
COPY backend/Kindred.Domain/*.csproj backend/Kindred.Domain/packages.lock.json backend/Kindred.Domain/
COPY backend/Kindred.Application/*.csproj backend/Kindred.Application/packages.lock.json backend/Kindred.Application/
COPY backend/Kindred.Infrastructure/*.csproj backend/Kindred.Infrastructure/packages.lock.json backend/Kindred.Infrastructure/
COPY backend/Kindred.Api/*.csproj backend/Kindred.Api/packages.lock.json backend/Kindred.Api/
RUN dotnet tool restore \
 && dotnet restore backend/Kindred.Api/Kindred.Api.csproj --locked-mode
COPY backend/ backend/
COPY docs/api/ docs/api/
RUN dotnet publish backend/Kindred.Api/Kindred.Api.csproj -c Release --no-restore -o /app/api -p:OpenApiGenerateDocuments=false
RUN dotnet ef migrations bundle \
      --project backend/Kindred.Infrastructure --startup-project backend/Kindred.Infrastructure \
      --configuration Release --self-contained --target-runtime linux-x64 --output /app/efbundle --force

# Migration image: applies migrations as the migration role, then exits. Never part of the API.
FROM mcr.microsoft.com/dotnet/runtime-deps:${DOTNET_VERSION} AS migrator
WORKDIR /app
COPY --from=build /app/efbundle ./efbundle
USER $APP_UID
ENTRYPOINT ["/bin/sh", "-c", "exec ./efbundle --connection \"$KINDRED_MIGRATOR_CONNECTION\""]

# API image: runs as a non-root user and listens on 8080.
FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS api
WORKDIR /app
COPY --from=build /app/api ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Kindred.Api.dll"]
