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
        
        /// <summary>
        /// Name specifying what the event is.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// String denoting which scope the action applies to.
        /// </summary>
        public string Scope { get; set; }

        /// <summary>
        /// The status of the command.
        /// </summary>
        public Status Status { get; set; }
    }
}
