using Entities.Models;

namespace Entities.ViewModels.Products
{
    public class BrandVW
    {
        public int Id { get; set; }
        public int TotalProductsCount { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }

        public List<SeriesVW> Series { get; set; } = new List<SeriesVW>();
    }
    public class BrandsVW
    {
        public int Id { get; set; }
        public int TotalProductsCount { get; set; }

        public string Title { get; set; }
        public string Icon { get; set; }
        public string ShortName { get; set; }
    }
}
