using Ardalis.GuardClauses;

namespace Entities.Models
{
    public class Pages
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }
        public string UrlAddress { get; set; }

        public void Update(PagesInput Input)
        {
            Guard.Against.NullOrEmpty(Input.Title, nameof(Input.Title));
            Title = Input.Title;

            Guard.Against.NullOrEmpty(Input.ShortName, nameof(Input.ShortName));
            ShortName = Input.ShortName;

            Guard.Against.NullOrEmpty(Input.UrlAddress, nameof(Input.UrlAddress));
            UrlAddress = Input.UrlAddress;

            Icon = Input.Icon;
        }
    }
}
