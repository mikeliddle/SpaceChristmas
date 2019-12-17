
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace SpaceChristmas.Models
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Event
    {
        [Key]
        [JsonProperty]
        [JsonRequired]
        public Guid Id { get; set; }
        
        public int SequenceNumber { get; set; }

        [JsonProperty]
        [JsonRequired]
        public DateTime TimeStamp { get; set; }

        [JsonProperty]
        [JsonRequired]
        /// <summary>
        /// Name specifying what the event is.
        /// </summary>
        public string Name { get; set; }

        [JsonProperty]
        [JsonRequired]
        /// <summary>
        /// String denoting which scope the action applies to.
        /// </summary>
        public string Scope { get; set; }

        [JsonProperty]
        [JsonRequired]
        /// <summary>
        /// The status of the command.
        /// </summary>
        public Status Status { get; set; }

        [JsonProperty]
        /// <summary>
        /// The id of the session the event belongs to.
        /// </summary>
        public Guid SessionId { get; set; }
    }
}
