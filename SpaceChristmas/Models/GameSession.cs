namespace SpaceChristmas.Models;

public class GameSession
{
    public Guid Id { get; set; }
    public string InviteCode { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public ICollection<Event> Events { get; set; } = new List<Event>();
}
