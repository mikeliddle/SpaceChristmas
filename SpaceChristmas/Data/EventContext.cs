using Microsoft.EntityFrameworkCore;

namespace SpaceChristmas.Models;

public class EventContext(DbContextOptions<EventContext> options) : DbContext(options)
{
    public DbSet<Event> Events => Set<Event>();
    public DbSet<GameSession> Sessions => Set<GameSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GameSession>(session =>
        {
            session.HasKey(x => x.Id);
            session.HasIndex(x => x.InviteCode).IsUnique();
            session.Property(x => x.InviteCode).IsRequired().HasMaxLength(32);
        });

        modelBuilder.Entity<Event>(evt =>
        {
            evt.HasKey(x => x.SequenceNumber);
            evt.Property(x => x.SequenceNumber).ValueGeneratedOnAdd();
            evt.HasIndex(x => x.Id).IsUnique();
            evt.HasIndex(x => new { x.SessionId, x.SequenceNumber });
            evt.Property(x => x.Name).IsRequired().HasMaxLength(128);
            evt.Property(x => x.Scope).IsRequired().HasMaxLength(128);
            evt.Property(x => x.Value).HasMaxLength(8192);
            evt.HasOne<GameSession>().WithMany(x => x.Events)
                .HasForeignKey(x => x.SessionId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
