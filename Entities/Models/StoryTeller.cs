using System.ComponentModel.DataAnnotations.Schema;

public class StoryPage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Template { get; set; } = "default";
    public string Style { get; set; } = "light";

    [Column(TypeName = "nvarchar(max)")]
    public string? Html { get; set; }
    public List<StoryBlock> Blocks { get; set; } = new();
}

public class StoryBlock
{
    public int Id { get; set; }
    public string BlockId { get; set; } = Guid.NewGuid().ToString();
    public string Type { get; set; } = "";
    public string? Heading { get; set; }
    public string? ContentJson { get; set; }
    public string? Image { get; set; }
    public string? VideoUrl { get; set; }
    public string? CustomHtml { get; set; }

    public int StoryPageId { get; set; }
    public StoryPage StoryPage { get; set; }
}


