using Entities.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities.Models
{
    public class PagesInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }
        public string UrlAddress { get; set; }
    }
}
