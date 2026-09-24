FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY SpaceChristmas/SpaceChristmas.csproj SpaceChristmas/
COPY SpaceChristmas-UX/SpaceChristmas-UX.csproj SpaceChristmas-UX/
RUN dotnet restore SpaceChristmas-UX/SpaceChristmas-UX.csproj
COPY SpaceChristmas/ SpaceChristmas/
COPY SpaceChristmas-UX/ SpaceChristmas-UX/
RUN dotnet publish SpaceChristmas-UX/SpaceChristmas-UX.csproj -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ConnectionStrings__EventContext="Data Source=/data/spacechristmas.db;Default Timeout=30"
ENV DataProtection__KeysPath=/keys
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "SpaceChristmas-UX.dll"]
