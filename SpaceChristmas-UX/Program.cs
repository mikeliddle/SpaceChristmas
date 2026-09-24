using System.Net;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using SpaceChristmas.Controllers;
using SpaceChristmas.Models;

var builder = WebApplication.CreateBuilder(args);
var keysPath = builder.Configuration["DataProtection:KeysPath"];
if (string.IsNullOrWhiteSpace(keysPath))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException("Set DataProtection__KeysPath to a persistent, writable directory.");
}
else
{
    if (!Path.IsPathFullyQualified(keysPath))
        throw new InvalidOperationException("DataProtection__KeysPath must be an absolute path.");
    Directory.CreateDirectory(keysPath);
    builder.Services.AddDataProtection()
        .SetApplicationName("SpaceChristmas")
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath));
}
builder.Services.AddDbContext<EventContext>((services, options) =>
    options.UseSqlite(services.GetRequiredService<IConfiguration>()
        .GetConnectionString("EventContext")));
builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("admin-login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});
builder.Services.AddControllers()
    .AddApplicationPart(typeof(EventsController).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.DictionaryKeyPolicy = null;
    });
builder.Services.AddRazorPages(options =>
{
    options.Conventions.AuthorizePage("/Master", "Admin");
    foreach (var station in new[] { "/Captain", "/Communications", "/Engineering",
                                    "/LeftWing", "/RightWing", "/Security" })
        options.Conventions.AuthorizePage(station, "Session");
});
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "spacechristmas";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
        options.LoginPath = "/Admin/Login";
        options.AccessDeniedPath = "/";
        options.Events.OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }
            context.Response.Redirect(context.Request.Path == "/Master" ||
                context.Request.Path.StartsWithSegments("/Admin")
                    ? context.RedirectUri : "/");
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            }
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireClaim("role", "admin"));
    options.AddPolicy("Session", policy => policy.RequireAssertion(context =>
        context.User.Identity?.IsAuthenticated == true &&
        Guid.TryParse(context.User.FindFirst("session")?.Value, out _)));
});

var proxy = builder.Configuration["ReverseProxy:KnownProxy"];
if (!string.IsNullOrWhiteSpace(proxy))
{
    if (!IPAddress.TryParse(proxy, out var address))
        throw new InvalidOperationException("ReverseProxy:KnownProxy must be an IP address.");
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownProxies.Add(address);
    });
}

var app = builder.Build();
if (string.IsNullOrWhiteSpace(app.Configuration.GetConnectionString("EventContext")))
    throw new InvalidOperationException("Set ConnectionStrings__EventContext to a persistent SQLite database.");
if (string.IsNullOrWhiteSpace(app.Configuration["Admin:Password"]))
    throw new InvalidOperationException("Set Admin__Password to a secret admin password.");
if (!app.Environment.IsDevelopment() && app.Configuration["AllowedHosts"] == "*")
    throw new InvalidOperationException("Set AllowedHosts to the public hostname in production.");
if (args.Contains("--migrate"))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<EventContext>().Database.MigrateAsync();
    return;
}
if (!string.IsNullOrWhiteSpace(proxy))
    app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    if (!string.IsNullOrEmpty(app.Configuration["HTTPS_PORT"]))
        app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api") &&
        !HttpMethods.IsGet(context.Request.Method) &&
        !HttpMethods.IsHead(context.Request.Method) &&
        context.Request.Headers["X-SpaceChristmas-Request"] != "1")
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }
    await next();
});
app.MapHealthChecks("/healthz");
app.MapControllers();
app.MapRazorPages();
app.Run();

public partial class Program;
