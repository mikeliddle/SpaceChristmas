# SpaceChristmas

One .NET 10 ASP.NET Core host (`SpaceChristmas-UX`) serves the Razor Pages, JavaScript and event API on the same origin. `SpaceChristmas` is the API/data library. An admin signs in at `/Admin/Login`, creates a game on `/Master`, and shares its 32-character invite code. Players join at `/` and select their station. Only the admin can open `/Master`; signed-in players and the admin can exchange events within their joined game. Invite codes are bearer credentials: share them only with players.

## Local development (PowerShell)

Install the .NET 10 SDK. The Development configuration uses a local SQLite database; set an uncommitted admin password:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:Admin__Password = '<choose-a-long-unique-password>'
Set-Location SpaceChristmas-UX
dotnet run -- --migrate
dotnet run
```

Open the URL printed by Kestrel, sign in at `/Admin/Login`, then share the invite code displayed on `/Master`. From the repository root, run checks with `dotnet test SpaceChristmas.sln` and `dotnet publish SpaceChristmas-UX/SpaceChristmas-UX.csproj -c Release -o publish`. With Node.js and a browser installed, `npm ci` then `npm run smoke:browser` exercises the published host; on Windows it uses Microsoft Edge, on Linux install Chromium with `npx playwright install --with-deps chromium` first. The database file and its WAL files are ignored by Git.

## Deployment

Set **`Admin__Password`** (a long, unique secret), **`ConnectionStrings__EventContext`** (`Data Source=/data/spacechristmas.db;Default Timeout=30` for example), **`AllowedHosts`** (the exact public hostname), and **`DataProtection__KeysPath`** (an absolute path to a persistent, writable key directory) outside source control. Startup rejects the development wildcard host setting and missing key storage in production. Keep the key directory private to the app and backed up with the database: cookie login and session access across restarts or same-host replicas require the same key ring and application name. Neither a secret nor a production connection string is committed. Store the SQLite file on a persistent, writable **local filesystem** volume shared by any same-machine instances; SQLite does not support multi-host network filesystem deployments. Back up the database and apply migrations once per deployment, **before** starting/restarting the host; the application does not automatically create or migrate schema. Run the following **from the published output directory** so its `wwwroot` assets resolve:

```powershell
dotnet SpaceChristmas-UX.dll --migrate
dotnet SpaceChristmas-UX.dll
```

For Docker: `docker build -t spacechristmas .`, then run the image once with `--migrate`, followed by the normal container. Pass `-e Admin__Password` from a secrets manager (or `--env-file` from a protected, untracked file), set `AllowedHosts`, and mount writable persistent directories at **both** `/data` and `/keys` in both runs; the container runs as the non-root .NET app user. `/keys` contains sensitive, unencrypted authentication key material; restrict filesystem access and use encrypted storage. Expose container port 8080 only behind a TLS-terminating reverse proxy. `/healthz` reports database connectivity and pending migrations; use it for readiness.

Terminate HTTPS at the trusted proxy and set `ReverseProxy__KnownProxy` to **that proxy's exact IP address** if it forwards `X-Forwarded-For`/`X-Forwarded-Proto`; untrusted forwarded headers are never honored. Use the proxy for HTTP-to-HTTPS redirects and set `ASPNETCORE_ENVIRONMENT=Production` (default). When serving HTTPS directly in Kestrel, configure its certificate and `HTTPS_PORT` to enable app-side redirection. Production cookies require HTTPS; keep the database path and secret durable across releases. Multiple instances sharing one SQLite file are supported only on the same host/local filesystem, with deployment migration run once. The event cursor is an SQLite `AUTOINCREMENT` key, so polling ordered by that key survives process restarts and writes by other instances.

The event API requires an authenticated session cookie. Event responses use PascalCase property names and numeric status; polling returns `{ "Events": [...], "Cursor": 42 }`. Mutation requests require the custom `X-SpaceChristmas-Request: 1` header; CORS is disabled, cookies are HttpOnly/SameSite=Strict, and this header prevents cross-site form submissions from changing game state. Admin login is rate-limited to five attempts per five minutes per client IP.
