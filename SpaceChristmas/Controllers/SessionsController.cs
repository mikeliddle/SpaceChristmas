using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceChristmas.Models;

namespace SpaceChristmas.Controllers;

public record JoinRequest([Required] string InviteCode);
public record SessionResponse(Guid Id, string InviteCode);

[ApiController]
[Route("api/sessions")]
public class SessionsController(EventContext context) : ControllerBase
{
    [Authorize(Policy = "Admin")]
    [HttpPost]
    public async Task<ActionResult<SessionResponse>> Create()
    {
        var session = new GameSession
        {
            Id = Guid.NewGuid(),
            InviteCode = Convert.ToHexString(RandomNumberGenerator.GetBytes(16)),
            CreatedAt = DateTime.UtcNow
        };
        context.Sessions.Add(session);
        await context.SaveChangesAsync();
        await SignIn(session.Id, admin: true);
        return Created("/api/sessions/current", new SessionResponse(session.Id, session.InviteCode));
    }

    [Authorize(Policy = "Admin")]
    [HttpGet("current")]
    public async Task<ActionResult<SessionResponse>> Current()
    {
        if (!Guid.TryParse(User.FindFirstValue("session"), out var id)) return NotFound();
        var session = await context.Sessions.AsNoTracking().SingleOrDefaultAsync(s => s.Id == id);
        return session is null ? NotFound() : new SessionResponse(session.Id, session.InviteCode);
    }

    [AllowAnonymous]
    [HttpPost("join")]
    public async Task<ActionResult<SessionResponse>> Join(JoinRequest request)
    {
        var code = request.InviteCode?.Trim().ToUpperInvariant();
        if (string.IsNullOrEmpty(code)) return BadRequest("Invite code is required.");
        var session = await context.Sessions.AsNoTracking().SingleOrDefaultAsync(s => s.InviteCode == code);
        if (session is null) return NotFound("Invite code not found.");
        await SignIn(session.Id, User.HasClaim("role", "admin"));
        return new SessionResponse(session.Id, session.InviteCode);
    }

    private async Task SignIn(Guid sessionId, bool admin)
    {
        var claims = new List<Claim> { new("session", sessionId.ToString()) };
        if (admin) claims.Add(new Claim("role", "admin"));
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
    }
}
