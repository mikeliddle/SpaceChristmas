using Microsoft.EntityFrameworkCore;

namespace SpaceChristmas.Models
{
    public class EventContext : DbContext
    {
        public EventContext (DbContextOptions<EventContext> options)
            : base(options)
        {
        }

        public DbSet<SpaceChristmas.Models.Event> Event { get; set; }
    }
}
