using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.ViewModels.Products
{
    public class StoryPageDto
    {
        public int Id { get; set; }
        public string Template { get; set; } = "default";
        public string Style { get; set; } = "light";
        public string? Html { get; set; }
        public List<StoryBlockDto> Blocks { get; set; } = new();
    }

    public class StoryBlockDto
    {
        public int Id { get; set; }
        public string BlockId { get; set; }
        public string Type { get; set; } = "";
        public string? Heading { get; set; }
        public List<string>? Content { get; set; }
        public string? Image { get; set; }
        public string? VideoUrl{ get; set; }
        public string? CustomHtml { get; set; }
        public int StoryPageId { get; set; }
    }
}
