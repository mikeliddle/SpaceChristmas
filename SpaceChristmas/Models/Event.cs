namespace SpaceChristmas.Models;

public class Event
{
    public long SequenceNumber { get; set; }
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public DateTime TimeStamp { get; set; }
    public string Name { get; set; } = "";
    public string Scope { get; set; } = "";
    public Status Status { get; set; }
    public string? Value { get; set; }
}
