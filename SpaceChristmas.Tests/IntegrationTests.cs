using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SpaceChristmas.Models;

namespace SpaceChristmas.Tests;

public class IntegrationTests
{
    private sealed class GameFactory(string database) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["Admin:Password"] = "test-admin-password",
                    ["ConnectionStrings:EventContext"] = $"Data Source={database};Default Timeout=30"
                }));
        }

        public HttpClient Client()
        {
            var client = CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                HandleCookies = true
            });
            client.DefaultRequestHeaders.Add("X-SpaceChristmas-Request", "1");
            return client;
        }

        public async Task Migrate()
        {
            using var scope = Services.CreateScope();
            await scope.ServiceProvider.GetRequiredService<EventContext>().Database.MigrateAsync();
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing: disposing);
            if (!disposing) return;
            SqliteConnection.ClearAllPools();
            foreach (var suffix in new[] { "", "-wal", "-shm" })
                File.Delete(database + suffix);
        }
    }

    private static string Database() =>
        Path.Combine(Path.GetTempPath(), $"spacechristmas-test-{Guid.NewGuid():N}.db");

    private static async Task<SessionResponse> Create(HttpClient admin)
    {
        Assert.Equal(HttpStatusCode.OK,
            (await admin.PostAsJsonAsync("/api/auth/login", new { password = "test-admin-password" })).StatusCode);
        var created = await admin.PostAsync("/api/sessions", null);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        return (await created.Content.ReadFromJsonAsync<SessionResponse>())!;
    }

    private static async Task Join(HttpClient client, string invite)
    {
        Assert.Equal(HttpStatusCode.OK,
            (await client.PostAsJsonAsync("/api/sessions/join", new { inviteCode = invite })).StatusCode);
    }

    private static object NewEvent(Guid? id = null) => new
    {
        Id = id ?? Guid.NewGuid(),
        TimeStamp = DateTime.UtcNow,
        Name = "newMessage",
        Scope = "communications",
        Status = 0,
        Value = "a message"
    };

    [Fact]
    public async Task AdminAndInviteAreRequired_AndCrossOriginMutationIsRejected()
    {
        using var factory = new GameFactory(Database());
        await factory.Migrate();
        using var guest = factory.Client();
        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.GetAsync("/api/events/0")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.PostAsync("/api/sessions", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Redirect, (await guest.GetAsync("/Master")).StatusCode);
        Assert.Equal("/", (await guest.GetAsync("/Captain")).Headers.Location?.OriginalString);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await guest.PostAsJsonAsync("/api/auth/login", new { password = "incorrect" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await guest.PostAsJsonAsync("/api/sessions/join", new { inviteCode = "missing" })).StatusCode);

        using var admin = factory.Client();
        var session = await Create(admin);
        Assert.Equal(32, session.InviteCode.Length);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/Master")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/sessions/current")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await guest.PostAsJsonAsync("/api/events", NewEvent())).StatusCode);

        using var noHeader = factory.Client();
        noHeader.DefaultRequestHeaders.Remove("X-SpaceChristmas-Request");
        Assert.Equal(HttpStatusCode.Forbidden,
            (await noHeader.PostAsJsonAsync("/api/sessions/join", new { inviteCode = session.InviteCode })).StatusCode);
        await Join(guest, session.InviteCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await guest.GetAsync("/api/sessions/current")).StatusCode);
        Assert.Equal(HttpStatusCode.Redirect, (await guest.GetAsync("/Master")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await guest.GetAsync("/Captain")).StatusCode);
        Assert.Equal(HttpStatusCode.Created,
            (await guest.PostAsJsonAsync("/api/events", NewEvent())).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await guest.PostAsync("/api/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await guest.GetAsync("/api/events/0")).StatusCode);
    }

    [Fact]
    public async Task CursorIsDatabaseGeneratedOrderedAndScopedAcrossInstances()
    {
        var path = Database();
        using var first = new GameFactory(path);
        using var second = new GameFactory(path);
        await first.Migrate();
        using var adminA = first.Client();
        using var adminB = second.Client();
        var sessionA = await Create(adminA);
        var sessionB = await Create(adminB);
        using var playerA = second.Client();
        await Join(playerA, sessionA.InviteCode);
        playerA.DefaultRequestHeaders.Add("sessionId", sessionB.Id.ToString());

        var a1 = await playerA.PostAsJsonAsync("/api/events", new
        {
            Id = Guid.NewGuid(),
            SessionId = sessionB.Id,
            TimeStamp = DateTime.UtcNow,
            Name = "newMessage",
            Scope = "communications",
            Status = 0
        });
        var b1 = await adminB.PostAsJsonAsync("/api/events", NewEvent());
        var a2 = await adminA.PostAsJsonAsync("/api/events", NewEvent());
        Assert.All(new[] { a1, b1, a2 }, r => Assert.Equal(HttpStatusCode.Created, r.StatusCode));
        var e1 = (await a1.Content.ReadFromJsonAsync<EventResponse>())!;
        var eb = (await b1.Content.ReadFromJsonAsync<EventResponse>())!;
        var e2 = (await a2.Content.ReadFromJsonAsync<EventResponse>())!;
        Assert.True(e1.SequenceNumber < eb.SequenceNumber && eb.SequenceNumber < e2.SequenceNumber);
        Assert.Equal(sessionA.Id, e1.SessionId);
        Assert.Equal(HttpStatusCode.OK, (await playerA.GetAsync(a1.Headers.Location)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await playerA.GetAsync($"/api/events/by-id/{eb.Id}")).StatusCode);

        var page = (await playerA.GetFromJsonAsync<EventPage>("/api/events/0"))!;
        Assert.Equal(new[] { e1.SequenceNumber, e2.SequenceNumber },
            page.Events.Select(e => e.SequenceNumber));
        Assert.Equal(e2.SequenceNumber, page.Cursor);
        Assert.Empty((await playerA.GetFromJsonAsync<EventPage>($"/api/events/{page.Cursor}"))!.Events);
        Assert.Equal(e2.SequenceNumber,
            (await playerA.GetFromJsonAsync<EventPage>($"/api/events/{page.Cursor}"))!.Cursor);
        Assert.Single((await adminB.GetFromJsonAsync<EventPage>("/api/events/0"))!.Events);

        Assert.Equal(HttpStatusCode.NotFound,
            (await playerA.PutAsJsonAsync($"/api/events/{eb.Id}", NewEvent(eb.Id))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await playerA.DeleteAsync($"/api/events/{eb.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent,
            (await playerA.PutAsJsonAsync($"/api/events/{e1.Id}", NewEvent(e1.Id))).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent,
            (await playerA.DeleteAsync($"/api/events/{e1.Id}")).StatusCode);
        var a3 = await playerA.PostAsJsonAsync("/api/events", NewEvent());
        Assert.Equal(HttpStatusCode.Created, a3.StatusCode);
        var e3 = (await a3.Content.ReadFromJsonAsync<EventResponse>())!;
        Assert.True(e3.SequenceNumber > e2.SequenceNumber);
        Assert.Equal(new[] { e3.SequenceNumber },
            (await adminA.GetFromJsonAsync<EventPage>($"/api/events/{page.Cursor}"))!.Events
                .Select(e => e.SequenceNumber));
        Assert.Equal(HttpStatusCode.BadRequest, (await adminA.GetAsync("/api/events/-1")).StatusCode);

        var concurrent = await Task.WhenAll(Enumerable.Range(0, 20).Select(i =>
            (i % 2 == 0 ? adminA : playerA).PostAsJsonAsync("/api/events", NewEvent())));
        Assert.All(concurrent, r => Assert.Equal(HttpStatusCode.Created, r.StatusCode));
        var after = (await adminA.GetFromJsonAsync<EventPage>($"/api/events/{e3.SequenceNumber}"))!;
        Assert.Equal(20, after.Events.Count);
        Assert.Equal(20, after.Events.Select(e => e.SequenceNumber).Distinct().Count());
        Assert.Equal(after.Events.Select(e => e.SequenceNumber).OrderBy(x => x),
            after.Events.Select(e => e.SequenceNumber));
    }

    [Fact]
    public async Task PollingBacklogAdvancesByReturnedCursorWithoutDuplicates()
    {
        using var factory = new GameFactory(Database());
        await factory.Migrate();
        using var admin = factory.Client();
        await Create(admin);

        for (var i = 0; i < 205; i++)
            Assert.Equal(HttpStatusCode.Created,
                (await admin.PostAsJsonAsync("/api/events", NewEvent())).StatusCode);

        var first = (await admin.GetFromJsonAsync<EventPage>("/api/events/0"))!;
        var second = (await admin.GetFromJsonAsync<EventPage>($"/api/events/{first.Cursor}"))!;
        Assert.Equal(200, first.Events.Count);
        Assert.Equal(5, second.Events.Count);
        var combined = first.Events.Concat(second.Events).Select(e => e.SequenceNumber).ToList();
        Assert.Equal(205, combined.Distinct().Count());
        Assert.Equal(combined.OrderBy(x => x), combined);
        Assert.Equal(combined[^1], second.Cursor);
        Assert.Empty((await admin.GetFromJsonAsync<EventPage>($"/api/events/{second.Cursor}"))!.Events);
    }

    [Fact]
    public async Task PagesAndAssetsShareOneOrigin()
    {
        using var factory = new GameFactory(Database());
        await factory.Migrate();
        using var client = factory.Client();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/Admin/Login")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/js/site.js")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/healthz")).StatusCode);
    }

    [Fact]
    public async Task ReadinessFailsUntilMigrationsAreApplied()
    {
        using var factory = new GameFactory(Database());
        using var client = factory.Client();
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync("/healthz")).StatusCode);
        await factory.Migrate();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/healthz")).StatusCode);
    }

    [Fact]
    public async Task AdminLoginIsRateLimited()
    {
        using var factory = new GameFactory(Database());
        using var client = factory.Client();
        for (var i = 0; i < 5; i++)
            Assert.Equal(HttpStatusCode.Unauthorized,
                (await client.PostAsJsonAsync("/api/auth/login", new { password = "wrong" })).StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests,
            (await client.PostAsJsonAsync("/api/auth/login", new { password = "test-admin-password" })).StatusCode);
    }

    private sealed record SessionResponse(Guid Id, string InviteCode);
    private sealed record EventResponse(Guid Id, long SequenceNumber, Guid SessionId);
    private sealed record EventPage(IReadOnlyList<EventResponse> Events, long Cursor);
}
