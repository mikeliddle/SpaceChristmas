using System;
using System.ComponentModel.DataAnnotations;

namespace SpaceChristmas.Models
{
    public class Event
    {
        [Key]
        public Guid Id { get; set; }
        public int SequenceNumber { get; set; }
        public DateTime TimeStamp { get; set; }
        public string Name { get; set; }
        public string Result { get; set; }
    }
}
