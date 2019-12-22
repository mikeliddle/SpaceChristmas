using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceChristmas.Models;

namespace SpaceChristmas.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly EventContext _context;
        private int sequenceNumber = 0;

        public EventsController(EventContext context)
        {
            _context = context;
            _context.Database.EnsureCreated();
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvent()
        {
            try
            {
                var sessionId = Request.Headers["sessionId"];
                var @event = _context.Event.Include(e => e.SessionId == sessionId);

                return await @event.ToListAsync();
            } 
            catch (Exception)
            {
                return BadRequest();
            }
        }

        // GET: api/Events/<int>
        [HttpGet("{sequenceNumber}")]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvent(int sequenceNumber)
        {
            try
            {
                var sessionId = Request.Headers["sessionId"];
                var @event = _context.Event.Include(e => e.SequenceNumber > sequenceNumber && e.SessionId == sessionId);

                return await @event.ToListAsync();
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }

        // PUT: api/Events/<guid>
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvent(Guid id, Event @event)
        {
            if (id != @event.Id)
            {
                return BadRequest();
            }

            _context.Entry(@event).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Events
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<Event>> PostEvent(Event @event)
        {
            try
            {
                string sessionId = Request.Headers["sessionId"];
                @event.SessionId = sessionId;
            }
            catch (Exception)
            {
                return BadRequest();
            }

            this.sequenceNumber += 1;
            @event.SequenceNumber = this.sequenceNumber;

            try
            {
                _context.Event.Add(@event);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetEvent", new { id = @event.Id }, @event);
            }
            catch (DbUpdateException)
            {
                return BadRequest("Duplicate Id Error!");
            }
        }

        // DELETE: api/Events/<guid>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Event>> DeleteEvent(Guid id)
        {
            string sessionId = Request.Headers["sessionId"];
            
            var @event = await _context.Event.FindAsync(id);

            if (@event == null || @event.SessionId != sessionId)
            {
                return NotFound();
            }

            _context.Event.Remove(@event);
            await _context.SaveChangesAsync();

            return @event;
        }

        private bool EventExists(Guid id)
        {
            string sessionId = Request.Headers["sessionId"];
            return _context.Event.Any(e => e.Id == id && e.SessionId == sessionId);
        }
    }
}
