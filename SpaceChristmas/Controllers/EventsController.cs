using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceChristmas.Models;

namespace SpaceChristmas.Controllers;

public record EventRequest(
    [Required] Guid Id,
    [Required] DateTime TimeStamp,
    [Required, StringLength(128, MinimumLength = 1)] string Name,
    [Required, StringLength(128, MinimumLength = 1)] string Scope,
    Status Status,
    [StringLength(8192)] string? Value);

public record EventResponse(Guid Id, long SequenceNumber, DateTime TimeStamp,
    string Name, string Scope, Status Status, Guid SessionId, string? Value)
{
    public static EventResponse From(Event evt) =>
        new(evt.Id, evt.SequenceNumber, evt.TimeStamp, evt.Name, evt.Scope,
            evt.Status, evt.SessionId, evt.Value);
}

public record EventPage(IReadOnlyList<EventResponse> Events, long Cursor);

[ApiController]
[Authorize(Policy = "Session")]
[Route("api/events")]
public class EventsController(EventContext context) : ControllerBase
{
    private Guid SessionId => Guid.Parse(User.FindFirstValue("session")!);

    [HttpGet]
    [HttpGet("{cursor:long}")]
    public async Task<ActionResult<EventPage>> Get(long cursor = 0)
    {
        if (cursor < 0) return BadRequest("Cursor must be nonnegative.");

        var events = await context.Events.AsNoTracking()
            .Where(e => e.SessionId == SessionId && e.SequenceNumber > cursor)
            .OrderBy(e => e.SequenceNumber).Take(200).ToListAsync();
        var response = events.Select(EventResponse.From).ToList();
        return new EventPage(response, response.Count == 0 ? cursor : response[^1].SequenceNumber);
    }

    [HttpGet("by-id/{id:guid}")]
    public async Task<ActionResult<EventResponse>> GetById(Guid id)
    {
        var evt = await context.Events.AsNoTracking()
            .SingleOrDefaultAsync(e => e.Id == id && e.SessionId == SessionId);
        return evt is null ? NotFound() : EventResponse.From(evt);
    }

    [HttpPost]
    public async Task<ActionResult<EventResponse>> Post(EventRequest request)
    {
        if (request.Id == Guid.Empty || request.TimeStamp == default || !Enum.IsDefined(request.Status))
            return BadRequest("A valid ID, timestamp and status are required.");

        var evt = new Event
        {
            Id = request.Id,
            SessionId = SessionId,
            TimeStamp = request.TimeStamp,
            Name = request.Name,
            Scope = request.Scope,
            Status = request.Status,
            Value = request.Value
        };
        context.Events.Add(evt);
        await context.SaveChangesAsync();
        return Created($"/api/events/by-id/{evt.Id}", EventResponse.From(evt));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Put(Guid id, EventRequest request)
    {
        if (id != request.Id || request.TimeStamp == default || !Enum.IsDefined(request.Status))
            return BadRequest("Event ID, timestamp or status is invalid.");

        var evt = await context.Events.SingleOrDefaultAsync(e => e.Id == id && e.SessionId == SessionId);
        if (evt is null) return NotFound();
        evt.Name = request.Name;
        evt.Scope = request.Scope;
        evt.Status = request.Status;
        evt.TimeStamp = request.TimeStamp;
        evt.Value = request.Value;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var evt = await context.Events.SingleOrDefaultAsync(e => e.Id == id && e.SessionId == SessionId);
        if (evt is null) return NotFound();
        context.Events.Remove(evt);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
