using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;

namespace SpaceChristmas.Controllers;

public record LoginRequest([Required] string Password);

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration configuration) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("admin-login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var configured = configuration["Admin:Password"]
            ?? throw new InvalidOperationException("Admin:Password is not configured.");
        var suppliedHash = SHA256.HashData(Encoding.UTF8.GetBytes(request.Password));
        var expectedHash = SHA256.HashData(Encoding.UTF8.GetBytes(configured));
        if (!CryptographicOperations.FixedTimeEquals(suppliedHash, expectedHash))
            return Unauthorized();

        var claims = new List<Claim> { new("role", "admin") };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}
